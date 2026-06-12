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
  // When an email is sent under a topic, recipients who unsubscribed from that
  // topic are dropped in addition to the globally suppressed ones, and the
  // unsubscribe link is scoped to the topic.
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
