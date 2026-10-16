import { eventRefWithoutHandlersByUserRefBySource } from '@/app/bundles/front-component-build/jsx-runtime/states/event-ref-without-handlers-by-user-ref-by-source';
import { type EventHandlerSource } from '@/app/bundles/front-component-build/jsx-runtime/types/event-handler-source.type';
import { type UserRef } from '@/app/bundles/front-component-build/jsx-runtime/types/user-ref.type';
import { createEventRef } from '@/app/bundles/front-component-build/jsx-runtime/utils/create-event-ref';

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
