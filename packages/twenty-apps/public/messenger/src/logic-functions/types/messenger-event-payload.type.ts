import { type MessengerMessagingEvent } from 'src/logic-functions/types/messenger-webhook.type';

export type MessengerEventPayload = {
  pageId: string;
  event: MessengerMessagingEvent;
};
