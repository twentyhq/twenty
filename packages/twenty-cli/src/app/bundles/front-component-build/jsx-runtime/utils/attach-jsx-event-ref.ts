import { type EventHandlersByPropName } from '@/app/bundles/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { type UserRef } from '@/app/bundles/front-component-build/jsx-runtime/types/user-ref.type';
import { applyUserRef } from '@/app/bundles/front-component-build/jsx-runtime/utils/apply-user-ref';
import { getCloneEventRefAttachmentOf } from '@/app/bundles/front-component-build/jsx-runtime/utils/get-clone-event-ref-attachment-of';
import { registerElementEventHandlers } from '@/app/bundles/front-component-build/jsx-runtime/utils/register-element-event-handlers';

export const attachJsxEventRef = ({
  element,
  events,
  userRef,
}: {
  element: EventTarget;
  events: EventHandlersByPropName;
  userRef: UserRef;
}) => {
  registerElementEventHandlers(element, events, 'jsx');

  const isAttachedWithoutCloneEventRef =
    getCloneEventRefAttachmentOf(element) === null;
  if (isAttachedWithoutCloneEventRef) {
    registerElementEventHandlers(element, {}, 'clone');
  }

  return applyUserRef(userRef, element);
};
