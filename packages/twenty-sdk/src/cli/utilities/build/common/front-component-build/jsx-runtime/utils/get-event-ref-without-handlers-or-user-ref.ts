import { eventRefWithoutHandlersOrUserRefBySource } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/states/event-ref-without-handlers-or-user-ref-by-source';
import { type EventHandlerSource } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handler-source.type';
import { createEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/create-event-ref';

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
