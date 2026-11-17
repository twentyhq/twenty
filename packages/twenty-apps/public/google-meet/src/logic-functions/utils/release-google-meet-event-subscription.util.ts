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
    // Held until Google answered, so no other workspace claims a subscription that is about to be deleted,
    // and released even on failure, so the account can be connected elsewhere.
    await kv.delete(eventSubscriptionKey);
    await kv.delete(eventSubscriptionKey, { scope: 'SERVER' });
  }
};
