import { type EmailRecipientsByFieldId } from '@/activities/emails/recipients/types/EmailRecipientsByFieldId';

// Applied to the latest recipients, so two field changes in one event both land.
export type EmailRecipientsByFieldIdUpdater = (
  recipientsByFieldId: EmailRecipientsByFieldId,
) => EmailRecipientsByFieldId;
