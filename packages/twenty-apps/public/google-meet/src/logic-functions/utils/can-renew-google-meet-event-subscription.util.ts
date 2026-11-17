import { GOOGLE_MEET_EVENT_TYPES } from 'src/logic-functions/constants/google-workspace-events.constant';
import { type GoogleMeetEventSubscription } from 'src/logic-functions/types/google-meet-event-subscription.type';

export const canRenewGoogleMeetEventSubscription = ({
  subscription,
  pubsubTopic,
}: {
  subscription: Pick<
    GoogleMeetEventSubscription,
    'notificationEndpoint' | 'state' | 'eventTypes'
  >;
  pubsubTopic: string;
}): boolean =>
  subscription.notificationEndpoint?.pubsubTopic === pubsubTopic &&
  subscription.state !== 'SUSPENDED' &&
  GOOGLE_MEET_EVENT_TYPES.every((eventType) =>
    subscription.eventTypes?.includes(eventType),
  );
