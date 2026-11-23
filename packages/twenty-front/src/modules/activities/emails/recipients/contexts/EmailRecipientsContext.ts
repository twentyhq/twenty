import { type DraggedEmailRecipients } from '@/activities/emails/recipients/types/DraggedEmailRecipients';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { type EmailRecipientsByFieldId } from '@/activities/emails/recipients/types/EmailRecipientsByFieldId';
import { type EmailRecipientsFieldId } from '@/activities/emails/recipients/types/EmailRecipientsFieldId';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type EmailRecipientsContextType = {
  recipientsByFieldId: EmailRecipientsByFieldId;
  draggedRecipients: DraggedEmailRecipients | null;
  setFieldRecipients: (args: {
    fieldId: EmailRecipientsFieldId;
    recipients: EmailRecipient[];
  }) => void;
};

export const [EmailRecipientsContextProvider, useEmailRecipientsContext] =
  createRequiredContext<EmailRecipientsContextType>('EmailRecipientsContext');
