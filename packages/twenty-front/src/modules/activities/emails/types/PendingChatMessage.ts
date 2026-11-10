import { type EmailAttachment } from 'twenty-shared/types';

export type PendingChatMessage = {
  id: string;
  text: string;
  attachments: EmailAttachment[];
  status: 'sending' | 'sent' | 'failed';
};
