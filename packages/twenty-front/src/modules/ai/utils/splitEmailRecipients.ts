import { isNonEmptyString } from '@sniptt/guards';

export const splitEmailRecipients = (recipients: string): string[] =>
  recipients
    .split(/[,;\s]+/)
    .map((recipient) => recipient.trim())
    .filter(isNonEmptyString);
