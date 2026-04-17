import type { EmailsField } from 'src/modules/resend/utils/to-emails-field';

export type CreateEmailDto = {
  subject: string;
  fromAddress: EmailsField;
  toAddresses: EmailsField;
  htmlBody: string;
  textBody: string;
  ccAddresses: EmailsField;
  bccAddresses: EmailsField;
  replyToAddresses: EmailsField;
  lastEvent: string;
  createdAt: string;
  scheduledAt: string | null;
  tags: Array<{ name: string; value: string }> | undefined;
  lastSyncedFromResend: string;
};
