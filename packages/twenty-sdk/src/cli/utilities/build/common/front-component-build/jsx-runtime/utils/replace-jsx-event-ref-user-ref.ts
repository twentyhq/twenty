import { type EventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-ref.type';
import { type UserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/user-ref.type';
import { createEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/create-event-ref';

export const replaceJsxEventRefUserRef = (
  jsxEventRef: EventRef,
  userRef: UserRef,
): EventRef => {
  const lastUserRefReplacement = jsxEventRef._lastUserRefReplacement;
  const canReuseLastUserRefReplacement =
    lastUserRefReplacement !== undefined &&
    lastUserRefReplacement._userRef === userRef;
  if (canReuseLastUserRefReplacement) {
    return lastUserRefReplacement;
  }

  const userRefReplacement = createEventRef(
    jsxEventRef._eventProps,
    userRef,
    'jsx',
  );
  jsxEventRef._lastUserRefReplacement = userRefReplacement;
  return userRefReplacement;
};
