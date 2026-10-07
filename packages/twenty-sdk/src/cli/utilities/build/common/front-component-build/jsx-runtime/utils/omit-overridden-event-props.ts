import { type EventHandlersByPropName } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';

export const omitOverriddenEventProps = (
  events: EventHandlersByPropName,
  isEventPropOverridden: (eventPropName: string) => boolean,
) => {
  let remainingEvents: EventHandlersByPropName | null = null;
  for (const eventPropName in events) {
    if (!isEventPropOverridden(eventPropName)) {
      remainingEvents = remainingEvents || {};
      remainingEvents[eventPropName] = events[eventPropName];
    }
  }
  return remainingEvents;
};
