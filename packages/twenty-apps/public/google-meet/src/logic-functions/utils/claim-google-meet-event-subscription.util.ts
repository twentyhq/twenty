import { kv } from 'twenty-sdk/logic-function';

import { getGoogleMeetEventSubscriptionKey } from 'src/logic-functions/utils/get-google-meet-event-subscription-key.util';

export const claimGoogleMeetEventSubscription = (
  subscriptionName: string,
): Promise<void> =>
  kv.set(getGoogleMeetEventSubscriptionKey(subscriptionName), null, {
    scope: 'SERVER',
  });
