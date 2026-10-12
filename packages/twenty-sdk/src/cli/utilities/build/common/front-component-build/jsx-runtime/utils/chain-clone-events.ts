import { type EventHandlersByPropName } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { chainEventHandlers } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/chain-event-handlers';
import { toNonEmptyCloneEventsOrNull } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/to-non-empty-clone-events-or-null';

export const chainCloneEvents = (
  innerCloneEvents: EventHandlersByPropName,
  outerCloneEvents: EventHandlersByPropName | null,
) => {
  const chainedCloneEvents: EventHandlersByPropName = Object.assign(
    {},
    innerCloneEvents,
  );
  for (const eventPropName in outerCloneEvents) {
    const innerHandler = innerCloneEvents[eventPropName];
    const outerHandler = outerCloneEvents[eventPropName];
    chainedCloneEvents[eventPropName] = innerHandler
      ? chainEventHandlers(innerHandler, outerHandler)
      : outerHandler;
  }
  return toNonEmptyCloneEventsOrNull(chainedCloneEvents);
};
