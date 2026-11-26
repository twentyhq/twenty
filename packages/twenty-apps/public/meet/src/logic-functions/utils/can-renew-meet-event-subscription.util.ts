import { MEET_EVENT_TYPES } from 'src/logic-functions/constants/google-workspace-events.constant';
import { type MeetEventSubscription } from 'src/logic-functions/types/meet-event-subscription.type';

export const canRenewMeetEventSubscription = ({
  subscription,
  pubsubTopic,
}: {
  subscription: Pick<
    MeetEventSubscription,
    'notificationEndpoint' | 'state' | 'eventTypes'
  >;
  pubsubTopic: string;
}): boolean =>
  subscription.notificationEndpoint?.pubsubTopic === pubsubTopic &&
  subscription.state !== 'SUSPENDED' &&
  MEET_EVENT_TYPES.every((eventType) =>
    subscription.eventTypes?.includes(eventType),
  );
