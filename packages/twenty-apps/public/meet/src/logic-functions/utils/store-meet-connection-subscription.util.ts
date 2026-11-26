import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { claimMeetEventSubscription } from 'src/logic-functions/utils/claim-meet-event-subscription.util';
import { getMeetConnectionSubscriptionKey } from 'src/logic-functions/utils/get-meet-connection-subscription-key.util';
import { getMeetEventSubscriptionKey } from 'src/logic-functions/utils/get-meet-event-subscription-key.util';
import { releaseMeetEventSubscription } from 'src/logic-functions/utils/release-meet-event-subscription.util';

export const storeMeetConnectionSubscription = async ({
  connectedAccountId,
  subscriptionName,
  replacedSubscriptionName,
}: {
  connectedAccountId: string;
  subscriptionName: string;
  replacedSubscriptionName: string | undefined;
}): Promise<void> => {
  const connectionSubscriptionKey =
    getMeetConnectionSubscriptionKey(connectedAccountId);
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

  await claimMeetEventSubscription(subscriptionName);
  await kv.set(
    getMeetEventSubscriptionKey(subscriptionName),
    connectedAccountId,
  );

  for (const staleSubscriptionName of staleSubscriptionNames) {
    await releaseMeetEventSubscription({
      connectedAccountId,
      subscriptionName: staleSubscriptionName,
    });
  }

  // Written last: a retry after a failed release still finds the stale name here.
  await kv.set(connectionSubscriptionKey, subscriptionName);
};
