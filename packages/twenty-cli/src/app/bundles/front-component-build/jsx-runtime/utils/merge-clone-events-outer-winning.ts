import { type EventHandlersByPropName } from '@/app/bundles/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';

export const mergeCloneEventsOuterWinning = (
  innerCloneEvents: EventHandlersByPropName,
  outerCloneEvents: EventHandlersByPropName | null,
): EventHandlersByPropName =>
  Object.assign({}, innerCloneEvents, outerCloneEvents);
