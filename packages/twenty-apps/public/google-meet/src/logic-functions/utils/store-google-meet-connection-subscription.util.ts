import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { getGoogleMeetConnectionSubscriptionKey } from 'src/logic-functions/utils/get-google-meet-connection-subscription-key.util';
import { getGoogleMeetEventSubscriptionKey } from 'src/logic-functions/utils/get-google-meet-event-subscription-key.util';

export const storeGoogleMeetConnectionSubscription = async ({
  connectedAccountId,
  subscriptionName,
}: {
  connectedAccountId: string;
  subscriptionName: string;
}): Promise<void> => {
  const connectionSubscriptionKey =
    getGoogleMeetConnectionSubscriptionKey(connectedAccountId);
  const eventSubscriptionKey =
    getGoogleMeetEventSubscriptionKey(subscriptionName);
  const previousSubscriptionName = await kv.get<string>(
    connectionSubscriptionKey,
  );

  await kv.set(eventSubscriptionKey, null, { scope: 'SERVER' });
  await kv.set(eventSubscriptionKey, connectedAccountId);
  await kv.set(connectionSubscriptionKey, subscriptionName);

  if (
    isNonEmptyString(previousSubscriptionName) &&
    previousSubscriptionName !== subscriptionName
  ) {
    const previousEventSubscriptionKey = getGoogleMeetEventSubscriptionKey(
      previousSubscriptionName,
    );

    await kv.delete(previousEventSubscriptionKey);
    await kv.delete(previousEventSubscriptionKey, { scope: 'SERVER' });
  }
};
