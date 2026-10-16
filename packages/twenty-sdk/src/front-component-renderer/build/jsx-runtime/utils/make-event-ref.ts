import { type EventHandlerSource } from '@/front-component-renderer/build/jsx-runtime/types/event-handler-source.type';
import { type EventHandlersByPropName } from '@/front-component-renderer/build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { type EventRef } from '@/front-component-renderer/build/jsx-runtime/types/event-ref.type';
import { type UserRef } from '@/front-component-renderer/build/jsx-runtime/types/user-ref.type';
import { createEventRef } from '@/front-component-renderer/build/jsx-runtime/utils/create-event-ref';
import { getEventRefWithoutHandlers } from '@/front-component-renderer/build/jsx-runtime/utils/get-event-ref-without-handlers';
import { getEventRefWithoutHandlersOrUserRef } from '@/front-component-renderer/build/jsx-runtime/utils/get-event-ref-without-handlers-or-user-ref';

export const makeEventRef = (
  events: EventHandlersByPropName | null,
  userRef: UserRef,
  source: EventHandlerSource,
): EventRef => {
  if (events) {
    return createEventRef(events, userRef, source);
  }

  if (userRef == null) {
    return getEventRefWithoutHandlersOrUserRef(source);
  }

  return getEventRefWithoutHandlers(userRef, source);
};
