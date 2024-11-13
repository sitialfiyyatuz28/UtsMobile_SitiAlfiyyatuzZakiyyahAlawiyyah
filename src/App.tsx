import {
    View, Text, TouchableOpacity,
    StyleSheet, FlatList, Alert, Modal, TextInput
} from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Task {
    id: number;
    title: string;
    time: string;
    description: string;
    status: string;
}

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Tambahkan state untuk login
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [title, setTitle] = useState('');
    const [time, setTime] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');

    const fetchData = async () => {
        try {
            const response = await axios.get('https://reqres.in/api/tasks?per_page=5'); // Example API URL
            setTasks(response.data.data);
        } catch (error) {
            console.log('Fetch Error:', error);
        }
    };

    const postData = async () => {
        try {
            const newTask = {
                title,
                time,
                description,
                status,
            };

            const response = await axios.post('https://reqres.in/api/tasks', newTask);
            const taskWithID = { id: response.data.id, ...newTask };

            setTasks((prevTasks) => [...prevTasks, taskWithID]);
            Alert.alert('Task Created', 'Task berhasil ditambahkan');
            resetForm();
            setModalVisible(false);
        } catch (error) {
            console.log('Post Error:', error);
        }
    };

    const resetForm = () => {
        setTitle('');
        setTime('');
        setDescription('');
        setStatus('');
    };

    const updateData = async (id: number) => {
        try {
            const updatedTask = {
                title,
                time,
                description,
                status,
            };

            await axios.put(`https://reqres.in/api/tasks/${id}`, updatedTask);

            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === id ? { ...task, ...updatedTask } : task
                )
            );

            Alert.alert('Task Updated', `Task ID: ${id} berhasil di Update`);
            resetForm();
            setModalVisible(false);
        } catch (error) {
            console.log('Update Error:', error);
        }
    };

    const deleteData = async (id: number) => {
        try {
            await axios.delete(`https://reqres.in/api/tasks/${id}`);
            setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
            Alert.alert('Task Deleted', `Task ID: ${id} berhasil di Delete`);
        } catch (error) {
            console.log('Delete Error:', error);
        }
    };

    useEffect(() => {
        if (isLoggedIn) fetchData();
    }, [isLoggedIn]);

    const renderItem = ({ item }: { item: Task }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.taskTime}>{item.time}</Text>
                <Text style={styles.taskDescription}>{item.description}</Text>
                <Text style={styles.taskStatus}>{item.status}</Text>
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={styles.updateButton}
                        onPress={() => {
                            setSelectedTask(item);
                            setTitle(item.title);
                            setTime(item.time);
                            setDescription(item.description);
                            setStatus(item.status);
                            setModalVisible(true);
                        }}
                    >
                        <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteData(item.id)}
                    >
                        <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const handleLogin = () => {
        // Sederhana: Username dan Password default
        if (username === 'alfi' && password === 'alfi') {
            setIsLoggedIn(true);
        } else {
            Alert.alert('Login Failed', 'Username atau Password salah');
        }
    };

    if (!isLoggedIn) {
        return (
            <View style={styles.loginContainer}>
                <Text style={styles.header}>Login</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    placeholderTextColor={'grey'}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    secureTextEntry
                    onChangeText={setPassword}
                    placeholderTextColor={'grey'}
                />
                <TouchableOpacity style={styles.saveButton} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={tasks}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={
                    <>
                        <Text style={styles.header}>To-Do List - Jadwal Kegiatan Harian</Text>
                        <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
                            <Text style={styles.buttonText}>Tambah Kegiatan</Text>
                        </TouchableOpacity>
                    </>
                }
                contentContainerStyle={styles.list}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>{selectedTask ? 'Update Kegiatan' : 'Tambah Kegiatan'}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Judul Kegiatan"
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Waktu"
                        value={time}
                        onChangeText={setTime}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Deskripsi"
                        value={description}
                        onChangeText={setDescription}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Status (Selesai/Belum)"
                        value={status}
                        onChangeText={setStatus}
                    />

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => {
                            if (selectedTask) {
                                updateData(selectedTask.id);
                            } else {
                                postData();
                            }
                        }}
                    >
                        <Text style={styles.buttonText}>{selectedTask ? 'Update' : 'Simpan'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                            setModalVisible(false);
                            resetForm();
                        }}
                    >
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

export default App;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f0f4f8',
        flex: 1,
    },
    loginContainer: {
        padding: 16,
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#f0f4f8',
    },
    header: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    createButton: {
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
    },
    cardContent: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    taskTime: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
    },
    taskDescription: {
        fontSize: 14,
        color: '#777',
        marginBottom: 4,
    },
    taskStatus: {
        fontSize: 14,
        color: '#007bff',
        fontWeight: '500',
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    updateButton: {
        backgroundColor: '#ffc107',
        padding: 8,
        borderRadius: 5,
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        padding: 8,
        borderRadius: 5,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: 15,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        width: '100%',
        paddingHorizontal: 10,
        color: 'black'
    },
    saveButton: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 5,
        marginVertical: 5,
        width: '100%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 5,
        marginVertical: 5,
        width: '100%',
        alignItems: 'center',
    },
});
