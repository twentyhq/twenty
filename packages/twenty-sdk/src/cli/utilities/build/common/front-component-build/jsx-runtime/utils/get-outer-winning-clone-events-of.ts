import { type EventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-ref.type';

export const getOuterWinningCloneEventsOf = (cloneEventRef: EventRef) =>
  cloneEventRef._outerWinningCloneEvents || cloneEventRef._eventProps;
