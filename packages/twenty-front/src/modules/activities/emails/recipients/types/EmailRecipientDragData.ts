import { type EmailRecipientsFieldId } from '@/activities/emails/recipients/types/EmailRecipientsFieldId';

export type EmailRecipientDragData = {
  fieldId: EmailRecipientsFieldId;
  index: number;
  // Chips carry the field selection they were rendered with so a drag that
  // starts on a selected chip moves the whole selection, not just that chip.
  selectedIndices: number[];
};
