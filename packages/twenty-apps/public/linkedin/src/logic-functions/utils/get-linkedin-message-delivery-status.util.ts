import { type IngestMessage } from 'twenty-sdk/logic-function';

import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';

export const getLinkedinMessageDeliveryStatus = (
  message: Pick<UnipileMessage, 'is_seen' | 'is_delivered'>,
): NonNullable<IngestMessage['deliveryStatus']> => {
  if (message.is_seen === true) {
    return 'READ';
  }

  if (message.is_delivered === true) {
    return 'DELIVERED';
  }

  return 'SENT';
};
