import { type EmailAttachment } from 'twenty-shared/types';

export type ComposeEmailParams = {
  recipients: {
    to: string;
    cc?: string;
    bcc?: string;
  };
  subject: string;
  body: string;
  connectedAccountId?: string;
  files?: Array<EmailAttachment>;
  inReplyTo?: string;
};
