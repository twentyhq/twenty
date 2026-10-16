import { type EventRef } from '@/front-component-renderer/build/jsx-runtime/types/event-ref.type';

export const getOuterWinningCloneEventsOf = (cloneEventRef: EventRef) =>
  cloneEventRef._outerWinningCloneEvents || cloneEventRef._eventHandlers;
