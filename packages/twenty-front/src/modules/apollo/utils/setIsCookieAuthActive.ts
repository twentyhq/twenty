import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

// Goes through the atom so the persisted key keeps a single writer, and so
// React subscribers follow without the caller mirroring this into component
// state. Guarded because it runs inside unauthenticated error handling, where
// blocked storage would otherwise throw out of the error path.
export const setIsCookieAuthActive = (isActive: boolean): void => {
  try {
    jotaiStore.set(isCookieAuthActiveState.atom, isActive);
  } catch {
    // noop
  }
};
