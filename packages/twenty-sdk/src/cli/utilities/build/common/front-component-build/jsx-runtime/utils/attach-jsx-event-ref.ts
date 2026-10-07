import { type EventHandlersByPropName } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { type UserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/user-ref.type';
import { applyUserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/apply-user-ref';
import { getCloneEventRefAttachmentOf } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/get-clone-event-ref-attachment-of';
import { registerElementEventHandlers } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/register-element-event-handlers';

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
