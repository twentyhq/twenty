import { eventRefWithoutHandlersByUserRefBySource } from '@/front-component-renderer/build/jsx-runtime/states/event-ref-without-handlers-by-user-ref-by-source';
import { type EventHandlerSource } from '@/front-component-renderer/build/jsx-runtime/types/event-handler-source.type';
import { type UserRef } from '@/front-component-renderer/build/jsx-runtime/types/user-ref.type';
import { createEventRef } from '@/front-component-renderer/build/jsx-runtime/utils/create-event-ref';

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
