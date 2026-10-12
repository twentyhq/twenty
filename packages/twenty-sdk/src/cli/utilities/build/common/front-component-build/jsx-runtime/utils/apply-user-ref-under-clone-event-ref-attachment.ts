import { cloneEventRefAttachmentState } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/states/clone-event-ref-attachment-state';
import { type CloneEventRefAttachment } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/clone-event-ref-attachment.type';
import { type UserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/user-ref.type';
import { applyUserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/apply-user-ref';

export const applyUserRefUnderCloneEventRefAttachment = (
  userRef: UserRef,
  attachment: CloneEventRefAttachment,
) => {
  const previousCloneEventRefAttachment = cloneEventRefAttachmentState.current;
  cloneEventRefAttachmentState.current = attachment;
  try {
    return applyUserRef(userRef, attachment.element);
  } finally {
    cloneEventRefAttachmentState.current = previousCloneEventRefAttachment;
  }
};
