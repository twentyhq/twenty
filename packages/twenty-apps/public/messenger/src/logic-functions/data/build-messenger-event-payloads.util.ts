import { getMessengerEventTimestamp } from 'src/logic-functions/data/get-messenger-event-timestamp.util';
import { isHandledMessengerEvent } from 'src/logic-functions/data/is-handled-messenger-event.util';
import { type MessengerWebhook } from 'src/logic-functions/types/messenger-webhook.type';
import { type MessengerEventPayload } from 'src/logic-functions/types/messenger-event-payload.type';

// Meta can deliver retries out of order, so jobs follow the event timestamps
export const buildMessengerEventPayloads = (
  webhook: MessengerWebhook,
): MessengerEventPayload[] =>
  (webhook.entry ?? [])
    .flatMap((entry) =>
      (entry.messaging ?? [])
        .filter(isHandledMessengerEvent)
        .map((event) => ({ pageId: entry.id, event })),
    )
    .sort(
      (first, second) =>
        getMessengerEventTimestamp(first.event) -
        getMessengerEventTimestamp(second.event),
    );
