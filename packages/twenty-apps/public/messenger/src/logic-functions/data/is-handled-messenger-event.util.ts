import { isDefined } from 'twenty-sdk/utils';

import { type MessengerMessagingEvent } from 'src/logic-functions/types/messenger-webhook.type';

export const isHandledMessengerEvent = (event: MessengerMessagingEvent) =>
  isDefined(event.message) ||
  isDefined(event.message_edit) ||
  isDefined(event.postback) ||
  isDefined(event.delivery) ||
  isDefined(event.read) ||
  isDefined(event.referral);
