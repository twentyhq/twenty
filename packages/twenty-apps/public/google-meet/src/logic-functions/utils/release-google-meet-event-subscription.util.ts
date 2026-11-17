import { kv } from 'twenty-sdk/logic-function';

import { deleteGoogleMeetEventSubscription } from 'src/logic-functions/utils/delete-google-meet-event-subscription.util';
import { getGoogleMeetEventSubscriptionKey } from 'src/logic-functions/utils/get-google-meet-event-subscription-key.util';

export const releaseGoogleMeetEventSubscription = async ({
  accessToken,
  subscriptionName,
}: {
  accessToken: string;
  subscriptionName: string;
}): Promise<void> => {
  const eventSubscriptionKey =
    getGoogleMeetEventSubscriptionKey(subscriptionName);

  await deleteGoogleMeetEventSubscription({ accessToken, subscriptionName });
  await kv.delete(eventSubscriptionKey);
  await kv.delete(eventSubscriptionKey, { scope: 'SERVER' });
};
