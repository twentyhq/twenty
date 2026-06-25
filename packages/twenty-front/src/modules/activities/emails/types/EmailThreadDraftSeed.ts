import { type EmailRecipients } from 'twenty-shared/workflow';

export type EmailThreadDraftSeed = EmailRecipients & {
  messageId: string;
  subject: string;
  body: string;
};
