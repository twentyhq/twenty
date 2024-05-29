import net from 'net';
import dotenv from 'dotenv';
import { on } from 'events';

// Load environment variables from .env file
dotenv.config();

const PG_HOST = process.env.PG_DATABASE_HOST || 'localhost'; // PostgreSQL server host
const PG_PORT = parseInt(process.env.PG_DATABASE_PORT || '5432'); // PostgreSQL server port
const PROXY_PORT = parseInt(process.env.PROXY_PORT || '5432') ; // Port for proxy server to listen on



const server = net.createServer((clientSocket) => {
    console.log('Client connected.');

    const clientIP = clientSocket.remoteAddress || '';
    console.log('clientIP', clientIP)

    const serverSocket = net.connect({ host: PG_HOST, port: PG_PORT }, () => {
        console.log('Proxy connected to PostgreSQL server.');
    });

    serverSocket.on('data', (data) => {
        console.log('PostgreSQL Response:', data.toString());
        clientSocket.write(data);
    });

    serverSocket.on('end', () => {
        console.log('PostgreSQL server connection closed.');
        clientSocket.end();
    });

    serverSocket.on('error', (err) => {
        console.log(`Server Error: ${err.message}, host: ${PG_HOST}, port: ${PG_PORT}`);
        serverSocket.destroy();
        clientSocket.end();
    });

    clientSocket.on('end', () => {
        console.log('Client disconnected.');
        serverSocket?.end();
    });

    clientSocket.on('error', (err) => {
        console.log('Client Error:', err.message);
        clientSocket.destroy();
        serverSocket?.end();
    });

    clientSocket.on('data', (data) => {
        serverSocket?.write(data);
    });
});

server.listen(PROXY_PORT, () => {
    console.log(`Proxy server listening on port ${PROXY_PORT}`);
});
