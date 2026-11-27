import { kv } from 'twenty-sdk/logic-function';

import { getMeetEventSubscriptionKey } from 'src/logic-functions/utils/get-meet-event-subscription-key.util';

export const claimMeetEventSubscription = (
  subscriptionName: string,
): Promise<void> =>
  kv.set(getMeetEventSubscriptionKey(subscriptionName), null, {
    scope: 'SERVER',
  });
