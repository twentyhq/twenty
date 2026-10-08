import { type CloneEventRefAttachment } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/clone-event-ref-attachment.type';
import { type EventHandlersByPropName } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { type UserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/user-ref.type';
import { applyUserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/apply-user-ref';
import { applyUserRefUnderCloneEventRefAttachment } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/apply-user-ref-under-clone-event-ref-attachment';
import { getCloneEventRefAttachmentOf } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/get-clone-event-ref-attachment-of';
import { registerElementEventHandlers } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/register-element-event-handlers';

export const attachCloneEventRef = ({
  element,
  events,
  userRef,
  outerWinningCloneEvents,
}: {
  element: EventTarget;
  events: EventHandlersByPropName;
  userRef: UserRef;
  outerWinningCloneEvents: EventHandlersByPropName | null | undefined;
}) => {
  const outerCloneEventRefAttachment = getCloneEventRefAttachmentOf(element);
  if (outerCloneEventRefAttachment !== null) {
    outerCloneEventRefAttachment.hasAttachedInnerCloneEventRef = true;
    return applyUserRef(userRef, element);
  }

  const attachment: CloneEventRefAttachment = {
    element,
    hasAttachedInnerCloneEventRef: false,
  };
  registerElementEventHandlers(element, events, 'clone');
  const userRefCleanup = applyUserRefUnderCloneEventRefAttachment(
    userRef,
    attachment,
  );

  const fallsBackToOuterWinningCloneEvents =
    !!outerWinningCloneEvents && !attachment.hasAttachedInnerCloneEventRef;
  if (fallsBackToOuterWinningCloneEvents) {
    registerElementEventHandlers(element, outerWinningCloneEvents, 'clone');
  }

  return userRefCleanup;
};
