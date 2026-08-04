import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

// Goes through the atom rather than localStorage so the persisted key keeps a
// single writer. Read straight off the store because the Apollo links run per
// request and must see the value synchronously, before the render a React
// subscription would wait for.
export const getIsCookieAuthActive = (): boolean => {
  try {
    return jotaiStore.get(isCookieAuthActiveState.atom) === true;
  } catch {
    return false;
  }
};

// Setting the atom propagates to React subscribers on its own, so the caller
// does not need to mirror this into component state. Guarded because it runs
// inside unauthenticated error handling, where blocked storage would otherwise
// throw out of the error path.
export const setIsCookieAuthActive = (isActive: boolean): void => {
  try {
    jotaiStore.set(isCookieAuthActiveState.atom, isActive);
  } catch {
    // noop
  }
};
