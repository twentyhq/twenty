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
};

export type EmailingDomainSendEmailInput = EmailingDomainEmailContent & {
  workspaceId: string;
  domain: string;
};

export type EmailingDomainSendEmailResult = {
  messageId: string;
};
