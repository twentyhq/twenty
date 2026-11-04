import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';

export type AiChatApprovalReviewEmailDraft = {
  to: EmailRecipient[];
  cc: EmailRecipient[];
  bcc: EmailRecipient[];
  subject: string;
  body: string;
  isCcBccExpanded: boolean;
};
