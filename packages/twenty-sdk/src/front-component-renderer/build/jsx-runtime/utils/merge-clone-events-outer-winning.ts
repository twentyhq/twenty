import { type EventHandlersByPropName } from '@/front-component-renderer/build/jsx-runtime/types/event-handlers-by-prop-name.type';

export const mergeCloneEventsOuterWinning = (
  innerCloneEvents: EventHandlersByPropName,
  outerCloneEvents: EventHandlersByPropName | null,
): EventHandlersByPropName =>
  Object.assign({}, innerCloneEvents, outerCloneEvents);
