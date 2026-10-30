import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';

export type AiActionEmailDraft = {
  to: EmailRecipient[];
  cc: EmailRecipient[];
  bcc: EmailRecipient[];
  subject: string;
  body: string;
};
