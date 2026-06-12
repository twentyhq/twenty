import type { EmailsField } from '@modules/resend/shared/types/emails-field';

export type UpdateBroadcastDto = {
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  segmentId?: string | null;
  topicId?: string | null;
  subject?: string;
  fromAddress?: EmailsField;
  replyTo?: EmailsField;
  previewText?: string;
  htmlBody?: string;
  textBody?: string;
};
