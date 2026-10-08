import { type EventHandlersByPropName } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';

export const mergeCloneEventsOuterWinning = (
  innerCloneEvents: EventHandlersByPropName,
  outerCloneEvents: EventHandlersByPropName | null,
): EventHandlersByPropName =>
  Object.assign({}, innerCloneEvents, outerCloneEvents);
