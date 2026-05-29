import { EmailGroupSendType } from 'src/engine/core-modules/emailing-domain/types/email-group-send-type.type';

export type EmailingDomainAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
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
  sendType?: EmailGroupSendType;
};

export type EmailingDomainSendEmailInput = EmailingDomainEmailContent & {
  workspaceId: string;
  domain: string;
};

export type EmailingDomainSendEmailResult = {
  messageId: string;
  deliveredRecipients: { to: string[]; cc: string[]; bcc: string[] };
};
