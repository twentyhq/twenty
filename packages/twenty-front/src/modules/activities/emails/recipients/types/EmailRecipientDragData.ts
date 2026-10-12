import { type EmailRecipientsFieldId } from '@/activities/emails/recipients/types/EmailRecipientsFieldId';

export type EmailRecipientDragData = {
  fieldId: EmailRecipientsFieldId;
  index: number;
  // So a drag starting on a selected chip moves the whole selection.
  selectedIndices: number[];
};
