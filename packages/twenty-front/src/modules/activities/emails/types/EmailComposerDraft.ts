import { type EmailAttachment } from 'twenty-shared/types';

import { type EmailRecipientsByFieldId } from '@/activities/emails/recipients/types/EmailRecipientsByFieldId';

export type EmailComposerDraft = {
  recipientsByFieldId: EmailRecipientsByFieldId;
  subject: string;
  body: string;
  files: EmailAttachment[];
};
