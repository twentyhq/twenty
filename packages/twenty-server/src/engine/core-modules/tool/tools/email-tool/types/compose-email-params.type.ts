import { type EmailAttachment } from 'twenty-shared/types';

export type ComposeEmailParams = {
  recipients: {
    to: string;
    cc?: string;
    bcc?: string;
  };
  subject: string;
  // An email document, validated by composeEmail: approved tool calls reach it unvalidated
  body: unknown;
  connectedAccountId?: string;
  fromHandle?: string;
  files?: Array<EmailAttachment>;
  inReplyTo?: string;
};
