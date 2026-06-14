import type { EmailsField } from '@modules/resend/shared/types/emails-field';

export type ContactDto = {
  email: EmailsField;
  name: { firstName: string; lastName: string };
  unsubscribed: boolean;
  createdAt: string;
  lastSyncedFromResend: string;
  personId?: string;
  segmentId?: string;
};
