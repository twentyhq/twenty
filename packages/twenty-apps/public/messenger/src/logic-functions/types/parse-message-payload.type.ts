import { type MessengerMessagingEvent } from 'src/logic-functions/types/messenger-webhook.type';

export type ParseMessagePayload = {
  pageId: string;
  event: MessengerMessagingEvent & { message: NonNullable<MessengerMessagingEvent['message']> };
};
