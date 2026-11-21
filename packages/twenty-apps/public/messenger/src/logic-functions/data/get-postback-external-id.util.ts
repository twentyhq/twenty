import { getMessengerEventTimestamp } from 'src/logic-functions/data/get-messenger-event-timestamp.util';
import { type MessengerMessagingEvent } from 'src/logic-functions/types/messenger-webhook.type';

// older postbacks carry no mid, so the sender and time identify them
export const getPostbackExternalId = (event: MessengerMessagingEvent) =>
  event.postback?.mid ?? `postback:${event.sender.id}:${getMessengerEventTimestamp(event)}`;
