import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';

export const serializeEmailRecipients = (
  recipients: EmailRecipient[],
): string => recipients.map((recipient) => recipient.address).join(', ');
