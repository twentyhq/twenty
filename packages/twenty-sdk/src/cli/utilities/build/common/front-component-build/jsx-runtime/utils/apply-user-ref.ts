import { type UserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/user-ref.type';

export const applyUserRef = (userRef: UserRef, element: EventTarget | null) => {
  if (typeof userRef === 'function') {
    return userRef(element);
  }

  const isObjectRef = userRef != null && typeof userRef === 'object';
  if (isObjectRef) {
    userRef.current = element;
  }
  return undefined;
};
