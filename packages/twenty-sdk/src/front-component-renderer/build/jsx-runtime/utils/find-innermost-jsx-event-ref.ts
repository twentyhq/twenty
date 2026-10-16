import { type EventRef } from '@/front-component-renderer/build/jsx-runtime/types/event-ref.type';
import { type UserRef } from '@/front-component-renderer/build/jsx-runtime/types/user-ref.type';
import { isCloneEventRef } from '@/front-component-renderer/build/jsx-runtime/utils/is-clone-event-ref';
import { isJsxEventRef } from '@/front-component-renderer/build/jsx-runtime/utils/is-jsx-event-ref';

export const findInnermostJsxEventRef = (ref: UserRef): EventRef | null => {
  let innerRef = ref;
  while (isCloneEventRef(innerRef)) {
    innerRef = innerRef._innerRef;
  }

  if (isJsxEventRef(innerRef)) {
    return innerRef;
  }

  return null;
};
