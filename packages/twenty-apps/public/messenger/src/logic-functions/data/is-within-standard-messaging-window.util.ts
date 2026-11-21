import { isDefined } from 'twenty-sdk/utils';

import { MESSENGER_STANDARD_MESSAGING_WINDOW_MS } from 'src/constants/messenger-standard-messaging-window-ms.constant';

export const isWithinStandardMessagingWindow = ({
  lastCustomerMessageAt,
  now = new Date(),
}: {
  lastCustomerMessageAt: Date | undefined;
  now?: Date;
}): boolean =>
  isDefined(lastCustomerMessageAt) &&
  now.getTime() - lastCustomerMessageAt.getTime() <
    MESSENGER_STANDARD_MESSAGING_WINDOW_MS;
