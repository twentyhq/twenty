import { type EventHandlerSource } from '@/app/bundles/front-component-build/jsx-runtime/types/event-handler-source.type';
import { type EventHandlersByPropName } from '@/app/bundles/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { type EventRef } from '@/app/bundles/front-component-build/jsx-runtime/types/event-ref.type';
import { type UserRef } from '@/app/bundles/front-component-build/jsx-runtime/types/user-ref.type';
import { applyUserRef } from '@/app/bundles/front-component-build/jsx-runtime/utils/apply-user-ref';
import { attachCloneEventRef } from '@/app/bundles/front-component-build/jsx-runtime/utils/attach-clone-event-ref';
import { attachJsxEventRef } from '@/app/bundles/front-component-build/jsx-runtime/utils/attach-jsx-event-ref';

export const createEventRef = (
  events: EventHandlersByPropName,
  userRef: UserRef,
  source: EventHandlerSource,
  outerWinningCloneEvents?: EventHandlersByPropName | null,
): EventRef => {
  function eventRef(element: EventTarget | null) {
    if (!element) {
      applyUserRef(userRef, element);
      return undefined;
    }

    const userRefCleanup =
      source === 'clone'
        ? attachCloneEventRef({
            element,
            events,
            userRef,
            outerWinningCloneEvents,
          })
        : attachJsxEventRef({ element, events, userRef });
    return typeof userRefCleanup === 'function' ? userRefCleanup : undefined;
  }

  return Object.assign(eventRef, {
    _eventHandlers: events,
    _outerWinningCloneEvents: outerWinningCloneEvents,
    _innerRef: userRef,
    _eventSource: source,
  });
};
