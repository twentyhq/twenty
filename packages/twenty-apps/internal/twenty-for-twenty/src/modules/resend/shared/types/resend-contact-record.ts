import type { EmailsField, FullNameField } from 'twenty-sdk/define';

export type ResendContactRecord = {
  id: string;
  resendId?: string;
  email?: EmailsField;
  name?: FullNameField;
  unsubscribed?: boolean;
  lastSyncedFromResend?: string;
};
