import { type EmailRecipientsFieldId } from '@/activities/emails/recipients/types/EmailRecipientsFieldId';

export type DraggedEmailRecipients = {
  fieldId: EmailRecipientsFieldId;
  indices: number[];
};
