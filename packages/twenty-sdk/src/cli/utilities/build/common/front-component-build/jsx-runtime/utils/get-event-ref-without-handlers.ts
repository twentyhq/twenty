import { eventRefWithoutHandlersByUserRefBySource } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/states/event-ref-without-handlers-by-user-ref-by-source';
import { type EventHandlerSource } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handler-source.type';
import { type UserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/user-ref.type';
import { createEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/create-event-ref';

export const getEventRefWithoutHandlers = (
  userRef: NonNullable<UserRef>,
  source: EventHandlerSource,
) => {
  const eventRefByUserRef = eventRefWithoutHandlersByUserRefBySource[source];
  const memoizedEventRef = eventRefByUserRef.get(userRef);
  if (memoizedEventRef) {
    return memoizedEventRef;
  }

  const eventRef = createEventRef({}, userRef, source);
  eventRefByUserRef.set(userRef, eventRef);
  return eventRef;
};
