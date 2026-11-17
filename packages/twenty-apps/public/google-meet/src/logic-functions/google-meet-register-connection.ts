import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { getConnection } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GOOGLE_MEET_PUBSUB_TOPIC_SERVER_VARIABLE_NAME } from 'src/constants/google-meet.constant';
import { GOOGLE_MEET_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GoogleMeetException } from 'src/logic-functions/types/google-meet-exception.type';
import { createGoogleMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/create-google-meet-event-subscription-or-throw.util';
import { findGoogleMeetEventSubscription } from 'src/logic-functions/utils/find-google-meet-event-subscription.util';
import { getConnectionAccessTokenOrThrow } from 'src/logic-functions/utils/get-connection-access-token-or-throw.util';
import { renewGoogleMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/renew-google-meet-event-subscription-or-throw.util';
import { storeGoogleMeetConnectionSubscription } from 'src/logic-functions/utils/store-google-meet-connection-subscription.util';

type GoogleMeetRegisterConnectionResult =
  | { success: true; subscriptionName: string }
  | { success: false; error: string };

export const googleMeetRegisterConnectionHandler = async ({
  connectedAccountId,
}: {
  connectedAccountId?: string;
}): Promise<GoogleMeetRegisterConnectionResult> => {
  if (!isNonEmptyString(connectedAccountId)) {
    return { success: false, error: 'Invalid Google Meet connection hook' };
  }

  const pubsubTopic =
    process.env[GOOGLE_MEET_PUBSUB_TOPIC_SERVER_VARIABLE_NAME];

  if (!isNonEmptyString(pubsubTopic)) {
    throw new GoogleMeetException({
      message: `${GOOGLE_MEET_PUBSUB_TOPIC_SERVER_VARIABLE_NAME} is required to receive Google Meet events`,
      code: 'PUBSUB_TOPIC_NOT_CONFIGURED',
    });
  }

  const connection = await getConnection(connectedAccountId);
  const accessToken = getConnectionAccessTokenOrThrow(connection);
  const googleUserId = connection.externalAccountId;

  if (!isNonEmptyString(googleUserId)) {
    throw new GoogleMeetException({
      message: `Connection ${connection.id} has no Google account id, reconnect it`,
      code: 'ACCOUNT_NOT_IDENTIFIED',
    });
  }

  const existingSubscription = await findGoogleMeetEventSubscription({
    accessToken,
    googleUserId,
  });
  const subscription = isDefined(existingSubscription)
    ? await renewGoogleMeetEventSubscriptionOrThrow({
        accessToken,
        subscriptionName: existingSubscription.name,
      })
    : await createGoogleMeetEventSubscriptionOrThrow({
        accessToken,
        googleUserId,
        pubsubTopic,
      });

  await storeGoogleMeetConnectionSubscription({
    connectedAccountId,
    subscriptionName: subscription.name,
  });

  return { success: true, subscriptionName: subscription.name };
};

export default defineLogicFunction({
  universalIdentifier: GOOGLE_MEET_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  name: 'google-meet-register-connection',
  description:
    'Subscribes to the Google Meet events of a Google account right after it is connected.',
  timeoutSeconds: 60,
  handler: googleMeetRegisterConnectionHandler,
});
