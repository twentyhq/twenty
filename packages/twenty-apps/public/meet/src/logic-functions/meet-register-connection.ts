import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { getConnection } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { MEET_PUBSUB_TOPIC_SERVER_VARIABLE_NAME } from 'src/constants/meet.constant';
import { MEET_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { MeetException } from 'src/logic-functions/types/meet-exception.type';
import { claimMeetEventSubscription } from 'src/logic-functions/utils/claim-meet-event-subscription.util';
import { ensureMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/ensure-meet-event-subscription-or-throw.util';
import { findMeetEventSubscription } from 'src/logic-functions/utils/find-meet-event-subscription.util';
import { getConnectionAccessTokenOrThrow } from 'src/logic-functions/utils/get-connection-access-token-or-throw.util';
import { storeMeetConnectionSubscription } from 'src/logic-functions/utils/store-meet-connection-subscription.util';

type MeetRegisterConnectionResult =
  | { success: true; subscriptionName: string }
  | { success: false; error: string };

export const meetRegisterConnectionHandler = async ({
  connectedAccountId,
}: {
  connectedAccountId?: string;
}): Promise<MeetRegisterConnectionResult> => {
  if (!isNonEmptyString(connectedAccountId)) {
    return { success: false, error: 'Invalid Google Meet connection hook' };
  }

  const pubsubTopic =
    process.env[MEET_PUBSUB_TOPIC_SERVER_VARIABLE_NAME];

  if (!isNonEmptyString(pubsubTopic)) {
    throw new MeetException({
      message: `${MEET_PUBSUB_TOPIC_SERVER_VARIABLE_NAME} is required to receive Google Meet events`,
      code: 'PUBSUB_TOPIC_NOT_CONFIGURED',
    });
  }

  const connection = await getConnection(connectedAccountId);
  const accessToken = getConnectionAccessTokenOrThrow(connection);
  const googleUserId = connection.externalAccountId;

  if (!isNonEmptyString(googleUserId)) {
    throw new MeetException({
      message: `Connection ${connection.id} has no Google account id, reconnect it`,
      code: 'ACCOUNT_NOT_IDENTIFIED',
    });
  }

  const existingSubscription = await findMeetEventSubscription({
    accessToken,
    googleUserId,
  });

  if (isDefined(existingSubscription)) {
    await claimMeetEventSubscription(existingSubscription.name);
  }

  const subscription = await ensureMeetEventSubscriptionOrThrow({
    accessToken,
    googleUserId,
    pubsubTopic,
    existingSubscription,
  });

  await storeMeetConnectionSubscription({
    connectedAccountId,
    subscriptionName: subscription.name,
    replacedSubscriptionName: existingSubscription?.name,
  });

  return { success: true, subscriptionName: subscription.name };
};

export default defineLogicFunction({
  universalIdentifier: MEET_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  name: 'meet-register-connection',
  description:
    'Subscribes to the Google Meet events of a Google account right after it is connected.',
  timeoutSeconds: 60,
  handler: meetRegisterConnectionHandler,
});
