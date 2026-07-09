import { isNonEmptyString } from '@sniptt/guards';

import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';

export const formatEmailRecipient = (recipient: EmailRecipient): string => {
  if (!isNonEmptyString(recipient.displayName)) {
    return recipient.address;
  }

  const requiresQuoting = /[,;<>@"]/.test(recipient.displayName);
  const formattedDisplayName = requiresQuoting
    ? `"${recipient.displayName.replaceAll('"', '\\"')}"`
    : recipient.displayName;

  return `${formattedDisplayName} <${recipient.address}>`;
};
