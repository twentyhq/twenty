import { type AiRunEvent } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

// The cursor step's tool results may have come in any order around the cursor, so a resume sends them again
const findEventIdsBeforeCursor = ({
  steps,
  after,
}: {
  steps: AiRunEvent[][];
  after: string;
}): string[] => {
  const cursorStepIndex = steps.findIndex((step) =>
    step.some(({ id }) => id === after),
  );

  if (cursorStepIndex === -1) {
    throw new AiException(
      `No event ${after} in this run`,
      AiExceptionCode.INVALID_AGENT_INPUT,
    );
  }

  const cursorStep = steps[cursorStepIndex];
  const cursorIndex = cursorStep.findIndex(({ id }) => id === after);

  return [
    ...steps.slice(0, cursorStepIndex).flat(),
    ...cursorStep
      .slice(0, cursorIndex)
      .filter(({ type }) => type !== 'TOOL_RESULT'),
    cursorStep[cursorIndex],
  ].map(({ id }) => id);
};

export const createAiRunEventFeed = ({ after }: { after?: string | null }) => {
  const handedOutEventIds = new Set<string>();
  let isCursorFound = !isDefined(after);

  return (steps: AiRunEvent[][]): AiRunEvent[] => {
    if (!isCursorFound && isDefined(after)) {
      findEventIdsBeforeCursor({ steps, after }).forEach((id) =>
        handedOutEventIds.add(id),
      );
      isCursorFound = true;
    }

    const newEvents = steps
      .flat()
      .filter(({ id }) => !handedOutEventIds.has(id));

    newEvents.forEach(({ id }) => handedOutEventIds.add(id));

    return newEvents;
  };
};
