import { eventRefWithoutHandlersOrUserRefBySource } from '@/front-component-renderer/build/jsx-runtime/states/event-ref-without-handlers-or-user-ref-by-source';
import { type EventHandlerSource } from '@/front-component-renderer/build/jsx-runtime/types/event-handler-source.type';
import { createEventRef } from '@/front-component-renderer/build/jsx-runtime/utils/create-event-ref';

export const getEventRefWithoutHandlersOrUserRef = (
  source: EventHandlerSource,
) => {
  const memoizedEventRef = eventRefWithoutHandlersOrUserRefBySource[source];
  if (memoizedEventRef) {
    return memoizedEventRef;
  }

  const eventRef = createEventRef({}, null, source);
  eventRefWithoutHandlersOrUserRefBySource[source] = eventRef;
  return eventRef;
};
