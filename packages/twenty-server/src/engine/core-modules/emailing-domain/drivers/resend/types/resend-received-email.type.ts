export type ResendReceivedEmail = {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  message_id?: string;
  created_at?: string;
  raw?: { download_url: string; expires_at: string };
};
