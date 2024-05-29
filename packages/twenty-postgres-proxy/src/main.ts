import net from 'net';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const PG_HOST = process.env.PG_DATABASE_HOST || 'localhost'; // PostgreSQL server host
const PG_PORT = parseInt(process.env.PG_DATABASE_PORT || '5432'); // PostgreSQL server port
const PROXY_PORT = parseInt(process.env.PROXY_PORT || '5432') ; // Port for proxy server to listen on

const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS || '').split(',');
const ALLOWED_IPS = (process.env.ALLOWED_IPS || '').split(',');
const ALLOWED_USERS = (process.env.ALLOWED_USERS || '').split(',');

function isAllowedIP(ip: string): boolean {
    return ALLOWED_IPS.includes('*') || ALLOWED_IPS.includes(ip);
}

function isAllowedHost(hostname: string): boolean {
    return ALLOWED_HOSTS.includes('*') || ALLOWED_HOSTS.includes(hostname);
}

function isAllowedUser(user: string): boolean {
    return ALLOWED_USERS.includes('*') || ALLOWED_USERS.includes(user);
}

const server = net.createServer((clientSocket) => {
    console.log('Client connected.');

    const clientIP = clientSocket.remoteAddress || '';
    if (!isAllowedIP(clientIP)) {
        console.log('Security check failed: IP not allowed');
        clientSocket.end('Security check failed: IP not allowed\n');
        return;
    }

    let serverSocket: net.Socket | null = null;

    clientSocket.once('data', (data) => {
        const dataString = data.toString();
        console.log('Received Data:', dataString);

        const hostnameMatch = dataString.match(/Host=([\w\.-]+)/);
        if (!hostnameMatch || !isAllowedHost(hostnameMatch[1])) {
            console.log('Security check failed: Host not allowed');
            clientSocket.end('Security check failed: Host not allowed\n');
            return;
        }

        const userMatch = dataString.match(/user=(\w+)\0/);
        if (userMatch) {
            const user = userMatch[1];
            console.log('Extracted User:', user);

            if (!isAllowedUser(user)) {
                console.log('Security check failed: User not allowed');
                clientSocket.end('Security check failed: User not allowed\n');
                return;
            }

            serverSocket = net.connect({ host: PG_HOST, port: PG_PORT }, () => {
                console.log('Proxy connected to PostgreSQL server.');
                serverSocket?.write(data);
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
                console.log('Server Error:', err.message);
                serverSocket.destroy();
                clientSocket.end();
            });
        } else {
            console.log('User not found in initial data.');
            clientSocket.end('Authentication details missing\n');
        }
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
