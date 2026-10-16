import { type EventHandlersByPropName } from '@/front-component-renderer/build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { chainEventHandlers } from '@/front-component-renderer/build/jsx-runtime/utils/chain-event-handlers';
import { toNonEmptyCloneEventsOrNull } from '@/front-component-renderer/build/jsx-runtime/utils/to-non-empty-clone-events-or-null';

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
