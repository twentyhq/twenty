import { type EventHandlersByPropName } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';

export const omitEventHandlers = (
  eventHandlers: EventHandlersByPropName,
  omittedEventPropNames: string[],
) => {
  const remainingEventHandlers: EventHandlersByPropName = {};
  for (const [eventPropName, eventHandler] of Object.entries(eventHandlers)) {
    const isOmitted = omittedEventPropNames.includes(eventPropName);
    if (!isOmitted) {
      remainingEventHandlers[eventPropName] = eventHandler;
    }
  }
  return remainingEventHandlers;
};
