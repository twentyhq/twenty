import { type AiRunEvent } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

// Each read hands over the run's events as they stand; the feed returns those not handed out yet,
// so a stream that reads again on every change never repeats an event
export const createAiRunEventFeed = ({ after }: { after?: string | null }) => {
  const handedOutEventIds = new Set<string>();
  let isCursorFound = !isDefined(after);

  return (events: AiRunEvent[]): AiRunEvent[] => {
    if (!isCursorFound) {
      const cursorIndex = events.findIndex(({ id }) => id === after);

      if (cursorIndex === -1) {
        throw new AiException(
          `No event ${after} in this run`,
          AiExceptionCode.INVALID_AGENT_INPUT,
        );
      }

      events
        .slice(0, cursorIndex + 1)
        .forEach(({ id }) => handedOutEventIds.add(id));
      isCursorFound = true;
    }

    const newEvents = events.filter(({ id }) => !handedOutEventIds.has(id));

    newEvents.forEach(({ id }) => handedOutEventIds.add(id));

    return newEvents;
  };
};
