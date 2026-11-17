import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';

import { GOOGLE_MEET_UNREGISTER_CONNECTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getGoogleMeetConnectionSubscriptionKey } from 'src/logic-functions/utils/get-google-meet-connection-subscription-key.util';
import { getGoogleMeetEventSubscriptionKey } from 'src/logic-functions/utils/get-google-meet-event-subscription-key.util';
import { releaseGoogleMeetEventSubscription } from 'src/logic-functions/utils/release-google-meet-event-subscription.util';

type GoogleMeetUnregisterConnectionResult =
  | { success: true; isSubscriptionDeleted: boolean }
  | { success: false; error: string };

export const googleMeetUnregisterConnectionHandler = async ({
  connectedAccountId,
}: {
  connectedAccountId?: string;
}): Promise<GoogleMeetUnregisterConnectionResult> => {
  if (!isNonEmptyString(connectedAccountId)) {
    return { success: false, error: 'Invalid Google Meet connection hook' };
  }

  const connectionSubscriptionKey =
    getGoogleMeetConnectionSubscriptionKey(connectedAccountId);
  const subscriptionName = await kv.get<string>(connectionSubscriptionKey);

  if (!isNonEmptyString(subscriptionName)) {
    return { success: true, isSubscriptionDeleted: false };
  }

  const eventSubscriptionKey =
    getGoogleMeetEventSubscriptionKey(subscriptionName);
  const subscribedConnectedAccountId =
    await kv.get<string>(eventSubscriptionKey);

  await kv.delete(connectionSubscriptionKey);

  if (subscribedConnectedAccountId !== connectedAccountId) {
    return { success: true, isSubscriptionDeleted: false };
  }

  await releaseGoogleMeetEventSubscription({
    connectedAccountId,
    subscriptionName,
  });

  return { success: true, isSubscriptionDeleted: true };
};

export default defineLogicFunction({
  universalIdentifier: GOOGLE_MEET_UNREGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  name: 'google-meet-unregister-connection',
  description:
    'Deletes the Google Meet event subscription of a Google account when its connection is removed.',
  timeoutSeconds: 30,
  handler: googleMeetUnregisterConnectionHandler,
});
