export interface ImapConfig {
  host: string;
  port: number;
  user: string;
  password: string; // Secure string
  tls?: boolean;
  rejectUnauthorized?: boolean; // For self-signed certs if needed
}
