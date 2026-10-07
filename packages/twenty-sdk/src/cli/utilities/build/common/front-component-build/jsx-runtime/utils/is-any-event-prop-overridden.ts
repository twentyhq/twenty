import { type EventHandlersByPropName } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';

export const isAnyEventPropOverridden = (
  events: EventHandlersByPropName,
  isEventPropOverridden: (eventPropName: string) => boolean,
) => {
  for (const eventPropName in events) {
    if (isEventPropOverridden(eventPropName)) {
      return true;
    }
  }
  return false;
};
