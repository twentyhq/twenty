import { isNonEmptyString } from '@sniptt/guards';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

const UNKNOWN_FIELD = 'unknown';

export const logDiscardedSlackEvent = ({
  body,
  skipReason,
}: {
  body: SlackEventsRequestBody;
  skipReason: string;
}): void => {
  const event = body.event;
  const messageReference = isNonEmptyString(event?.channel)
    ? ` in ${event.channel}:${event.ts ?? UNKNOWN_FIELD}`
    : '';

  console.warn(
    `[slack] discarded event ${body.event_id ?? UNKNOWN_FIELD} (${
      event?.type ?? UNKNOWN_FIELD
    })${messageReference}: ${skipReason}`,
  );
};
