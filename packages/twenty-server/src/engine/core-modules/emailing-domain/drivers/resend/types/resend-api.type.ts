export type ResendDomainRecord = {
  record: string;
  name: string;
  type: string;
  value: string;
  status?: string;
  priority?: number;
};

export type ResendDomain = {
  id: string;
  name: string;
  status: string;
  region?: string;
  records?: ResendDomainRecord[];
};

export type ResendSendEmailPayload = {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  reply_to?: string[];
  subject: string;
  text: string;
  html?: string;
  headers?: Record<string, string>;
  tags?: { name: string; value: string }[];
  attachments?: { filename: string; content: string; content_type?: string }[];
};

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

export type ResendErrorBody = {
  statusCode?: number;
  name?: string;
  message?: string;
};
