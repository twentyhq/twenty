import addressparser from 'addressparser';
import { isNonEmptyString } from '@sniptt/guards';

import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';

export const parseEmailRecipients = (rawText: string): EmailRecipient[] => {
  const normalizedText = rawText.replace(/\r?\n/g, ',');

  try {
    return addressparser(normalizedText)
      .flatMap((parsedAddress) => parsedAddress.group ?? [parsedAddress])
      .map((parsedAddress) =>
        isNonEmptyString(parsedAddress.address)
          ? {
              address: parsedAddress.address,
              displayName: isNonEmptyString(parsedAddress.name)
                ? parsedAddress.name
                : undefined,
            }
          : { address: parsedAddress.name.trim(), displayName: undefined },
      )
      .filter((recipient) => isNonEmptyString(recipient.address));
  } catch {
    return [];
  }
};
