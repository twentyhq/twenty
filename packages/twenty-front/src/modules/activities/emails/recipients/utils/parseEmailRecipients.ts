import { isNonEmptyString } from '@sniptt/guards';
import { parseEmailAddressList } from 'twenty-shared/utils';

import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';

export const parseEmailRecipients = (rawText: string): EmailRecipient[] => {
  const normalizedText = rawText.replace(/\r?\n/g, ',');

  return parseEmailAddressList(normalizedText).map((parsedAddress) =>
    isNonEmptyString(parsedAddress.address)
      ? {
          address: parsedAddress.address,
          displayName: isNonEmptyString(parsedAddress.name)
            ? parsedAddress.name
            : undefined,
        }
      : { address: parsedAddress.name },
  );
};
