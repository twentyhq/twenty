import { type MessengerMessagingEvent } from 'src/logic-functions/types/messenger-webhook.type';

export const getMessengerEventTimestamp = (event: MessengerMessagingEvent) =>
  event.timestamp ?? event.delivery?.watermark ?? event.read?.watermark ?? 0;
