import { getConnection, kv } from 'twenty-sdk/logic-function';

import { deleteGoogleMeetEventSubscription } from 'src/logic-functions/utils/delete-google-meet-event-subscription.util';
import { getConnectionAccessTokenOrThrow } from 'src/logic-functions/utils/get-connection-access-token-or-throw.util';
import { getGoogleMeetEventSubscriptionKey } from 'src/logic-functions/utils/get-google-meet-event-subscription-key.util';

export const releaseGoogleMeetEventSubscription = async ({
  connectedAccountId,
  subscriptionName,
}: {
  connectedAccountId: string;
  subscriptionName: string;
}): Promise<void> => {
  const eventSubscriptionKey =
    getGoogleMeetEventSubscriptionKey(subscriptionName);

  try {
    await deleteGoogleMeetEventSubscription({
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
