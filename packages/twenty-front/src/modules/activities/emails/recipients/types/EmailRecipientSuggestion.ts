import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';

export type EmailRecipientSuggestion = {
  suggestionId: string;
  recipient: EmailRecipient;
  label: string;
  secondaryText: string;
  avatarUrl?: string;
  avatarColorSeed: string;
};
