import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useAuth } from '@/auth/hooks/useAuth';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { clearSessionLocalStorageKeys } from '@/auth/utils/clearSessionLocalStorageKeys';
import { StopImpersonationDocument } from '~/generated-metadata/graphql';

const IMPERSONATION_SESSION_KEY = 'impersonation_original_session';

type StoredImpersonationSession = {
  returnPath: string;
};

// Session swaps without a full reload would require enumerating every
// user-scoped atom, localStorage entry, and Apollo cache key — brittle, and
// silently broken every time a new piece of user state is added.
const reloadWithSession = (returnPath: string) => {
  window.location.assign(returnPath);
};

export const useImpersonationSession = () => {
  const store = useStore();
  const { getAuthTokensFromLoginToken, signOut } = useAuth();
  const [stopImpersonationMutation] = useMutation(StopImpersonationDocument);

  const startImpersonating = useCallback(
    async (loginToken: string, returnPath?: string) => {
      const targetPath = returnPath ?? window.location.pathname;

      if (store.get(isCookieAuthActiveState.atom)) {
        const session: StoredImpersonationSession = { returnPath: targetPath };

        sessionStorage.setItem(
          IMPERSONATION_SESSION_KEY,
          JSON.stringify(session),
        );
      }

      try {
        await getAuthTokensFromLoginToken(loginToken);
      } catch (error) {
        sessionStorage.removeItem(IMPERSONATION_SESSION_KEY);
        throw error;
      }

      clearSessionLocalStorageKeys();
      reloadWithSession(targetPath);
    },
    [store, getAuthTokensFromLoginToken],
  );

  const stopImpersonating = useCallback(async () => {
    const raw = sessionStorage.getItem(IMPERSONATION_SESSION_KEY);
    let returnPath = window.location.pathname;

    if (raw !== null) {
      sessionStorage.removeItem(IMPERSONATION_SESSION_KEY);
      try {
        returnPath = (JSON.parse(raw) as StoredImpersonationSession).returnPath;
      } catch {}
    }

    try {
      const { data } = await stopImpersonationMutation();

      if (data?.stopImpersonation.canRestoreImpersonatorSession === true) {
        clearSessionLocalStorageKeys();
        reloadWithSession(returnPath);

        return;
      }
    } catch {}

    // Cross-workspace: the admin session on its own origin was never replaced.
    window.close();
    await signOut();
  }, [signOut, stopImpersonationMutation]);

  const hasStoredSession = useCallback(() => {
    return sessionStorage.getItem(IMPERSONATION_SESSION_KEY) !== null;
  }, []);

  return { startImpersonating, stopImpersonating, hasStoredSession };
};
