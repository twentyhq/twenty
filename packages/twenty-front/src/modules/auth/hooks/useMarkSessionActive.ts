import { useStore } from 'jotai';
import { useCallback } from 'react';

import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { isPendingServerSignOutState } from '@/auth/states/isPendingServerSignOutState';
import { rotateSessionGeneration } from '@/auth/utils/rotateSessionGeneration';

// The session cookie is httpOnly, so every auth flow must record that a session now exists.
export const useMarkSessionActive = () => {
  const store = useStore();

  return useCallback(() => {
    rotateSessionGeneration();
    store.set(isCookieAuthActiveState.atom, true);
    store.set(isPendingServerSignOutState.atom, false);
  }, [store]);
};
