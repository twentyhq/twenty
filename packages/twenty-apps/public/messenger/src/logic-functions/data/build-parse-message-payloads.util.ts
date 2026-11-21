import { isHandledMessengerEvent } from 'src/logic-functions/data/is-handled-messenger-event.util';
import { type MessengerWebhook } from 'src/logic-functions/types/messenger-webhook.type';
import { type ParseMessagePayload } from 'src/logic-functions/types/parse-message-payload.type';

// Meta can deliver retries out of order, so jobs follow the event timestamps
export const buildParseMessagePayloads = (
  webhook: MessengerWebhook,
): ParseMessagePayload[] =>
  (webhook.entry ?? [])
    .flatMap((entry) =>
      (entry.messaging ?? [])
        .filter(isHandledMessengerEvent)
        .map((event) => ({ pageId: entry.id, event })),
    )
    .sort(
      (first, second) => first.event.timestamp - second.event.timestamp,
    );
