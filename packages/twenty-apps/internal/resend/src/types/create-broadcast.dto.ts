import type { EmailsField } from 'src/utils/to-emails-field';

export type CreateBroadcastDto = {
  name: string;
  subject: string | null;
  fromAddress: EmailsField;
  replyTo: EmailsField;
  previewText: string;
  status: string;
  createdAt: string;
  scheduledAt: string | null;
  sentAt: string | null;
  segmentId?: string;
  templateId?: string;
};
