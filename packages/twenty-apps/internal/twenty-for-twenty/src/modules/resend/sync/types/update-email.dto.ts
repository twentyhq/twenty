import type { EmailsField } from 'src/modules/resend/shared/types/emails-field';
import type { LastEvent } from 'src/modules/resend/shared/utils/map-last-event';

export type UpdateEmailDto = {
  subject: string;
  fromAddress: EmailsField;
  toAddresses: EmailsField;
  ccAddresses: EmailsField;
  bccAddresses: EmailsField;
  replyToAddresses: EmailsField;
  lastEvent?: LastEvent;
  scheduledAt: string | null;
  lastSyncedFromResend: string;
};
