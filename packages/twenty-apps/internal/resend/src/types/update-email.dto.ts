import type { EmailsField } from 'src/utils/to-emails-field';

export type UpdateEmailDto = {
  subject: string;
  fromAddress: EmailsField;
  toAddresses: EmailsField;
  ccAddresses: EmailsField;
  bccAddresses: EmailsField;
  replyToAddresses: EmailsField;
  lastEvent: string;
  scheduledAt: string | null;
  lastSyncedFromResend: string;
};
