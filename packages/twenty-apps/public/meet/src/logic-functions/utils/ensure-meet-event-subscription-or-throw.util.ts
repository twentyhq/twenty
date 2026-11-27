import { isDefined } from 'twenty-sdk/utils';

import { type MeetEventSubscription } from 'src/logic-functions/types/meet-event-subscription.type';
import { canRenewMeetEventSubscription } from 'src/logic-functions/utils/can-renew-meet-event-subscription.util';
import { createMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/create-meet-event-subscription-or-throw.util';
import { deleteMeetEventSubscription } from 'src/logic-functions/utils/delete-meet-event-subscription.util';
import { renewMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/renew-meet-event-subscription-or-throw.util';

export const ensureMeetEventSubscriptionOrThrow = async ({
  accessToken,
  googleUserId,
  pubsubTopic,
  existingSubscription,
}: {
  accessToken: string;
  googleUserId: string;
  pubsubTopic: string;
  existingSubscription: MeetEventSubscription | undefined;
}): Promise<MeetEventSubscription> => {
  if (!isDefined(existingSubscription)) {
    return createMeetEventSubscriptionOrThrow({
      accessToken,
      googleUserId,
      pubsubTopic,
    });
  }

  if (
    canRenewMeetEventSubscription({
      subscription: existingSubscription,
      pubsubTopic,
    })
  ) {
    return renewMeetEventSubscriptionOrThrow({
      accessToken,
      subscriptionName: existingSubscription.name,
    });
  }

  // Renewing only extends a subscription: it cannot change its topic or event types, or resume a suspended one.
  await deleteMeetEventSubscription({
    accessToken,
    subscriptionName: existingSubscription.name,
  });

  return createMeetEventSubscriptionOrThrow({
    accessToken,
    googleUserId,
    pubsubTopic,
  });
};
