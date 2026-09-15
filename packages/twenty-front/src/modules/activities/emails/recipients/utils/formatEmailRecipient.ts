import { formatEmailAddress } from 'twenty-shared/utils';

import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';

export const formatEmailRecipient = (recipient: EmailRecipient): string =>
  formatEmailAddress({
    address: recipient.address,
    name: recipient.displayName,
  });
