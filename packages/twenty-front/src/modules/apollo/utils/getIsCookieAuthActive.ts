import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

// Read straight off the store rather than through a subscription because the
// Apollo links run per request and must see the value synchronously, before
// the render a React subscription would wait for.
export const getIsCookieAuthActive = (): boolean => {
  try {
    return jotaiStore.get(isCookieAuthActiveState.atom) === true;
  } catch {
    return false;
  }
};
