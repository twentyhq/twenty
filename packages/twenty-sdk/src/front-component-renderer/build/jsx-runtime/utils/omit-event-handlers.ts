import { type EventHandlersByPropName } from '@/front-component-renderer/build/jsx-runtime/types/event-handlers-by-prop-name.type';

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
