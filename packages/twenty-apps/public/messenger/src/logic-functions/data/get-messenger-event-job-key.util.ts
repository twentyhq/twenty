import { isDefined } from 'twenty-sdk/utils';

import { getMessengerEventTimestamp } from 'src/logic-functions/data/get-messenger-event-timestamp.util';
import { getPostbackExternalId } from 'src/logic-functions/data/get-postback-external-id.util';
import { type MessengerMessagingEvent } from 'src/logic-functions/types/messenger-webhook.type';

// collapses Meta's duplicate deliveries of the same event into one job
export const getMessengerEventJobKey = (event: MessengerMessagingEvent) => {
  if (isDefined(event.message)) {
    return event.message.mid;
  }

  if (isDefined(event.message_edit)) {
    return `edit:${event.message_edit.mid}:${event.message_edit.num_edit}`;
  }

  if (isDefined(event.postback)) {
    return getPostbackExternalId(event);
  }

  if (isDefined(event.delivery)) {
    return `delivery:${event.sender.id}:${event.delivery.watermark}`;
  }

  if (isDefined(event.read)) {
    return `read:${event.sender.id}:${event.read.watermark}`;
  }

  return `referral:${event.sender.id}:${getMessengerEventTimestamp(event)}`;
};
