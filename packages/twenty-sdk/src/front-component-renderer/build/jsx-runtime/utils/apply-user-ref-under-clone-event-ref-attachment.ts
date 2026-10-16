import { cloneEventRefAttachmentState } from '@/front-component-renderer/build/jsx-runtime/states/clone-event-ref-attachment-state';
import { type CloneEventRefAttachment } from '@/front-component-renderer/build/jsx-runtime/types/clone-event-ref-attachment.type';
import { type UserRef } from '@/front-component-renderer/build/jsx-runtime/types/user-ref.type';
import { applyUserRef } from '@/front-component-renderer/build/jsx-runtime/utils/apply-user-ref';

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
