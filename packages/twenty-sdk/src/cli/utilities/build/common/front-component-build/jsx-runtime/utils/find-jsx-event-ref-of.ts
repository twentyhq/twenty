import { type UserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/user-ref.type';
import { isCloneEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/is-clone-event-ref';
import { isJsxEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/is-jsx-event-ref';

export const findJsxEventRefOf = (ref: UserRef) => {
  let currentRef = ref;
  while (isCloneEventRef(currentRef)) {
    currentRef = currentRef._userRef;
  }

  return isJsxEventRef(currentRef) ? currentRef : null;
};
