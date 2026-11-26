import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';

import { MEET_UNREGISTER_CONNECTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getMeetConnectionSubscriptionKey } from 'src/logic-functions/utils/get-meet-connection-subscription-key.util';
import { getMeetEventSubscriptionKey } from 'src/logic-functions/utils/get-meet-event-subscription-key.util';
import { releaseMeetEventSubscription } from 'src/logic-functions/utils/release-meet-event-subscription.util';

type MeetUnregisterConnectionResult =
  | { success: true; isSubscriptionDeleted: boolean }
  | { success: false; error: string };

export const meetUnregisterConnectionHandler = async ({
  connectedAccountId,
}: {
  connectedAccountId?: string;
}): Promise<MeetUnregisterConnectionResult> => {
  if (!isNonEmptyString(connectedAccountId)) {
    return { success: false, error: 'Invalid Google Meet connection hook' };
  }

  const connectionSubscriptionKey =
    getMeetConnectionSubscriptionKey(connectedAccountId);
  const subscriptionName = await kv.get<string>(connectionSubscriptionKey);

  if (!isNonEmptyString(subscriptionName)) {
    return { success: true, isSubscriptionDeleted: false };
  }

  const eventSubscriptionKey =
    getMeetEventSubscriptionKey(subscriptionName);
  const subscribedConnectedAccountId =
    await kv.get<string>(eventSubscriptionKey);

  await kv.delete(connectionSubscriptionKey);

  if (subscribedConnectedAccountId !== connectedAccountId) {
    return { success: true, isSubscriptionDeleted: false };
  }

  await releaseMeetEventSubscription({
    connectedAccountId,
    subscriptionName,
  });

  return { success: true, isSubscriptionDeleted: true };
};

export default defineLogicFunction({
  universalIdentifier: MEET_UNREGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  name: 'meet-unregister-connection',
  description:
    'Deletes the Google Meet event subscription of a Google account when its connection is removed.',
  timeoutSeconds: 30,
  handler: meetUnregisterConnectionHandler,
});
