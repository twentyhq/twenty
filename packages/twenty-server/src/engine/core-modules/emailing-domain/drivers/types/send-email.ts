import { EmailGroupMessageCategory } from 'src/engine/core-modules/emailing-domain/types/email-group-message-category.type';

export type EmailingDomainAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
};

export type EmailingDomainHeader = {
  name: string;
  value: string;
};

export type EmailingDomainEmailContent = {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string[];
  attachments?: EmailingDomainAttachment[];
  headers?: EmailingDomainHeader[];
  messageCategory?: EmailGroupMessageCategory;
  // When a marketing email targets a specific list, recipients who unsubscribed
  // from that list are dropped in addition to the globally suppressed ones.
  messageTopicId?: string;
};

export type EmailingDomainSendEmailInput = EmailingDomainEmailContent & {
  workspaceId: string;
  domain: string;
};

export type EmailingDomainSendEmailResult = {
  messageId: string;
  deliveredRecipients: { to: string[]; cc: string[]; bcc: string[] };
};
