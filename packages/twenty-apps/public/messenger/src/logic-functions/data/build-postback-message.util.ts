import { isNonEmptyString } from '@sniptt/guards';

import { getPostbackExternalId } from 'src/logic-functions/data/get-postback-external-id.util';
import {
  type MessengerMessagingEvent,
  type MessengerPostback,
  type MessengerWebhookMessage,
} from 'src/logic-functions/types/messenger-webhook.type';

// the button title is what the customer saw and tapped; the payload is the Page's own code for it
export const buildPostbackMessage = (
  event: MessengerMessagingEvent & { postback: MessengerPostback },
): MessengerWebhookMessage => ({
  mid: getPostbackExternalId(event),
  text: `[Tapped] ${[event.postback.title, event.postback.payload].find(isNonEmptyString) ?? 'a button'}`,
});
