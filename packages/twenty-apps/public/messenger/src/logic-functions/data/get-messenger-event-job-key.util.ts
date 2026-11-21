import { isDefined } from 'twenty-sdk/utils';

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

  return `referral:${event.sender.id}:${event.timestamp}`;
};
