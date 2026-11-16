import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { type EmailRecipientsFieldId } from '@/activities/emails/recipients/types/EmailRecipientsFieldId';

export type EmailRecipientsByFieldId = Record<
  EmailRecipientsFieldId,
  EmailRecipient[]
>;
