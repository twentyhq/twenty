import { type MeetEventSubscription } from 'src/logic-functions/types/meet-event-subscription.type';

export type GoogleWorkspaceEventsOperation = {
  name?: string;
  done?: boolean;
  response?: MeetEventSubscription;
  error?: { message?: string; status?: string };
};
