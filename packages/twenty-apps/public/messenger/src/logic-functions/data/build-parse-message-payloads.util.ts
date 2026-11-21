import { isDefined } from 'twenty-sdk/utils';

import { type MessengerWebhook } from 'src/logic-functions/types/messenger-webhook.type';
import { type ParseMessagePayload } from 'src/logic-functions/types/parse-message-payload.type';

// Meta can deliver retries out of order, so jobs follow the event timestamps
export const buildParseMessagePayloads = (
  webhook: MessengerWebhook,
): ParseMessagePayload[] =>
  (webhook.entry ?? [])
    .flatMap((entry) =>
      (entry.messaging ?? []).flatMap((event) => {
        const { message } = event;

        return isDefined(message)
          ? [{ pageId: entry.id, event: { ...event, message } }]
          : [];
      }),
    )
    .sort(
      (first, second) => first.event.timestamp - second.event.timestamp,
    );
