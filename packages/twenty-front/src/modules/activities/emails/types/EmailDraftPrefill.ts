import { type EmailRecipients } from 'twenty-shared/workflow';

export type EmailDraftPrefill = EmailRecipients & {
  messageId: string;
  subject: string;
  body: string;
};
