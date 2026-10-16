import { type EventHandlersByPropName } from '@/app/bundles/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';

export const toNonEmptyCloneEventsOrNull = (
  cloneEvents: EventHandlersByPropName,
) => (Object.keys(cloneEvents).length > 0 ? cloneEvents : null);
