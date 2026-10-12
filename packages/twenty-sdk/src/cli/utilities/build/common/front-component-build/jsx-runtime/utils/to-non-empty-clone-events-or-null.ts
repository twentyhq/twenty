import { type EventHandlersByPropName } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';

export const toNonEmptyCloneEventsOrNull = (
  cloneEvents: EventHandlersByPropName,
) => (Object.keys(cloneEvents).length > 0 ? cloneEvents : null);
