import { getConnection, kv } from 'twenty-sdk/logic-function';

import { deleteMeetEventSubscription } from 'src/logic-functions/utils/delete-meet-event-subscription.util';
import { getConnectionAccessTokenOrThrow } from 'src/logic-functions/utils/get-connection-access-token-or-throw.util';
import { getMeetEventSubscriptionKey } from 'src/logic-functions/utils/get-meet-event-subscription-key.util';

export const releaseMeetEventSubscription = async ({
  connectedAccountId,
  subscriptionName,
}: {
  connectedAccountId: string;
  subscriptionName: string;
}): Promise<void> => {
  const eventSubscriptionKey =
    getMeetEventSubscriptionKey(subscriptionName);

  try {
    await deleteMeetEventSubscription({
      accessToken: getConnectionAccessTokenOrThrow(
        await getConnection(connectedAccountId),
      ),
      subscriptionName,
    });
  } finally {
    // The claim outlives the Google call, so no other workspace takes a subscription about to be deleted.
    await kv.delete(eventSubscriptionKey);
    await kv.delete(eventSubscriptionKey, { scope: 'SERVER' });
  }
};
