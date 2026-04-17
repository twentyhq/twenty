import type { EmailsField } from 'src/modules/resend/types/emails-field';

export type ContactDto = {
  email: EmailsField;
  name: { firstName: string; lastName: string };
  unsubscribed: boolean;
  createdAt: string;
  lastSyncedFromResend: string;
};
