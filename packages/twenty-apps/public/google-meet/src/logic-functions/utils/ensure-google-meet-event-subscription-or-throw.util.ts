import { isDefined } from 'twenty-sdk/utils';

import { type GoogleMeetEventSubscription } from 'src/logic-functions/types/google-meet-event-subscription.type';
import { createGoogleMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/create-google-meet-event-subscription-or-throw.util';
import { deleteGoogleMeetEventSubscription } from 'src/logic-functions/utils/delete-google-meet-event-subscription.util';
import { renewGoogleMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/renew-google-meet-event-subscription-or-throw.util';

export const ensureGoogleMeetEventSubscriptionOrThrow = async ({
  accessToken,
  googleUserId,
  pubsubTopic,
  existingSubscription,
}: {
  accessToken: string;
  googleUserId: string;
  pubsubTopic: string;
  existingSubscription: GoogleMeetEventSubscription | undefined;
}): Promise<GoogleMeetEventSubscription> => {
  if (!isDefined(existingSubscription)) {
    return createGoogleMeetEventSubscriptionOrThrow({
      accessToken,
      googleUserId,
      pubsubTopic,
    });
  }

  if (existingSubscription.notificationEndpoint?.pubsubTopic === pubsubTopic) {
    return renewGoogleMeetEventSubscriptionOrThrow({
      accessToken,
      subscriptionName: existingSubscription.name,
    });
  }

  // Google does not let a subscription move to another topic.
  await deleteGoogleMeetEventSubscription({
    accessToken,
    subscriptionName: existingSubscription.name,
  });

  return createGoogleMeetEventSubscriptionOrThrow({
    accessToken,
    googleUserId,
    pubsubTopic,
  });
};
