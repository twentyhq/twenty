import { useStore } from 'jotai';
import { useCallback } from 'react';

import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { isPendingServerSignOutState } from '@/auth/states/isPendingServerSignOutState';

// The auth mutations set the session cookie server-side, which the client
// cannot read, so every flow that authenticates has to record that a session
// now exists. Missing this leaves useIsLogged false on an authenticated client.
export const useMarkSessionActive = () => {
  const store = useStore();

  return useCallback(() => {
    store.set(isCookieAuthActiveState.atom, true);
    store.set(isPendingServerSignOutState.atom, false);
  }, [store]);
};
