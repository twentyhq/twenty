export interface ImapMessage {
  messageId: string;
  uid: number;
  subject: string;
  from: string | { name?: string; address?: string };
  to: { name?: string; address?: string }[];
  date: Date;
  textBody: string;
  htmlBody: string;
  hasAttachments: boolean;
  inReplyTo?: string;
  references?: string[];
}
