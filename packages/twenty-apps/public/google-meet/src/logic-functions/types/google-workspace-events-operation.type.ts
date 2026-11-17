import { type GoogleMeetEventSubscription } from 'src/logic-functions/types/google-meet-event-subscription.type';

export type GoogleWorkspaceEventsOperation = {
  done?: boolean;
  response?: GoogleMeetEventSubscription;
  error?: { message?: string; status?: string };
};
