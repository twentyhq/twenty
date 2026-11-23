import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { claimGoogleMeetEventSubscription } from 'src/logic-functions/utils/claim-google-meet-event-subscription.util';
import { getGoogleMeetConnectionSubscriptionKey } from 'src/logic-functions/utils/get-google-meet-connection-subscription-key.util';
import { getGoogleMeetEventSubscriptionKey } from 'src/logic-functions/utils/get-google-meet-event-subscription-key.util';
import { releaseGoogleMeetEventSubscription } from 'src/logic-functions/utils/release-google-meet-event-subscription.util';

export const storeGoogleMeetConnectionSubscription = async ({
  connectedAccountId,
  subscriptionName,
  replacedSubscriptionName,
}: {
  connectedAccountId: string;
  subscriptionName: string;
  replacedSubscriptionName: string | undefined;
}): Promise<void> => {
  const connectionSubscriptionKey =
    getGoogleMeetConnectionSubscriptionKey(connectedAccountId);
  const previousSubscriptionName = await kv.get<string>(
    connectionSubscriptionKey,
  );
  const staleSubscriptionNames = new Set(
    [previousSubscriptionName, replacedSubscriptionName]
      .filter(isNonEmptyString)
      .filter(
        (staleSubscriptionName) => staleSubscriptionName !== subscriptionName,
      ),
  );

  await claimGoogleMeetEventSubscription(subscriptionName);
  await kv.set(
    getGoogleMeetEventSubscriptionKey(subscriptionName),
    connectedAccountId,
  );

  for (const staleSubscriptionName of staleSubscriptionNames) {
    await releaseGoogleMeetEventSubscription({
      connectedAccountId,
      subscriptionName: staleSubscriptionName,
    });
  }

  // Written last: a retry after a failed release still finds the stale name here.
  await kv.set(connectionSubscriptionKey, subscriptionName);
};
