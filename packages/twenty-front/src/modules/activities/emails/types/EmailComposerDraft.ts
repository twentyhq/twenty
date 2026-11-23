import { type EmailAttachment } from 'twenty-shared/types';

import { type ConnectedAccountSender } from '@/accounts/types/ConnectedAccountSender';
import { type EmailRecipientsByFieldId } from '@/activities/emails/recipients/types/EmailRecipientsByFieldId';

export type EmailComposerDraft = {
  recipientsByFieldId: EmailRecipientsByFieldId;
  subject: string;
  body: string;
  files: EmailAttachment[];
  pickedSender: {
    defaultConnectedAccountId: string;
    sender: ConnectedAccountSender;
  } | null;
  pendingAppSend: {
    emailKey: string;
    idempotencyKey: string;
  } | null;
};
