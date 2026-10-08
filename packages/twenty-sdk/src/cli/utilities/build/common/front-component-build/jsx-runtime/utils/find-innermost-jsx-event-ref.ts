import { type EventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-ref.type';
import { type UserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/user-ref.type';
import { isCloneEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/is-clone-event-ref';
import { isJsxEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/is-jsx-event-ref';

export const findInnermostJsxEventRef = (ref: UserRef): EventRef | null => {
  let innerRef = ref;
  while (isCloneEventRef(innerRef)) {
    innerRef = innerRef._userRef;
  }

  if (isJsxEventRef(innerRef)) {
    return innerRef;
  }

  return null;
};
