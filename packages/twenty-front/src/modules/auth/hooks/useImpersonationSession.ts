import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useAuth } from '@/auth/hooks/useAuth';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { clearSessionLocalStorageKeys } from '@/auth/utils/clearSessionLocalStorageKeys';
import {
  type AuthTokenPair,
  StopImpersonationDocument,
} from '~/generated-metadata/graphql';

const IMPERSONATION_SESSION_KEY = 'impersonation_original_session';

type StoredImpersonationSession = {
  tokenPair?: AuthTokenPair;
  returnPath: string;
};

// Token swaps without a full reload would require enumerating every
// user-scoped atom, localStorage entry, and Apollo cache key — brittle and
// silently broken every time a new piece of user state is added. Instead,
// swap the credential (token pair or session cookie) and let the browser
// re-bootstrap the app.
const reloadWithSession = (returnPath: string) => {
  window.location.assign(returnPath);
};

export const useImpersonationSession = () => {
  const store = useStore();
  const { getAuthTokensFromLoginToken, signOut } = useAuth();
  const [stopImpersonationMutation] = useMutation(StopImpersonationDocument);

  const startImpersonating = useCallback(
    async (loginToken: string, returnPath?: string) => {
      const currentTokenPair = store.get(tokenPairState.atom);
      const isCookieAuthActive = store.get(isCookieAuthActiveState.atom);
      const targetPath = returnPath ?? window.location.pathname;

      if (currentTokenPair || isCookieAuthActive) {
        const session: StoredImpersonationSession = {
          // In cookie mode there is nothing to stash: the server replaces
          // and later restores the session cookie itself.
          ...(currentTokenPair ? { tokenPair: currentTokenPair } : {}),
          returnPath: targetPath,
        };

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

      if (isCookieAuthActive) {
        // The exchange set the impersonation session cookie; drop the token
        // pair it also returned so the cookie stays the only credential.
        store.set(tokenPairState.atom, null);
      }

      clearSessionLocalStorageKeys();
      reloadWithSession(targetPath);
    },
    [store, getAuthTokensFromLoginToken],
  );

  const stopImpersonating = useCallback(async () => {
    const raw = sessionStorage.getItem(IMPERSONATION_SESSION_KEY);
    const isCookieAuthActive = store.get(isCookieAuthActiveState.atom);

    if (isCookieAuthActive) {
      let returnPath = window.location.pathname;

      if (raw !== null) {
        sessionStorage.removeItem(IMPERSONATION_SESSION_KEY);
        try {
          returnPath = (JSON.parse(raw) as StoredImpersonationSession)
            .returnPath;
        } catch {
          // Fall back to reloading in place.
        }
      }

      try {
        const { data } = await stopImpersonationMutation();

        if (data?.stopImpersonation.canRestoreImpersonatorSession === true) {
          store.set(tokenPairState.atom, null);
          clearSessionLocalStorageKeys();
          reloadWithSession(returnPath);

          return;
        }
      } catch {
        // Revocation failed: fall through to closing or signing out.
      }

      // Cross-workspace tab: the admin session on the admin origin was never
      // replaced, so just close. Fall back to sign out if the browser blocks
      // window.close().
      window.close();
      await signOut();

      return;
    }

    if (raw === null) {
      // Cross-workspace tab opened via redirect — no stored admin session
      // to restore. Close the tab; fall back to sign out if the browser
      // blocks window.close().
      window.close();
      await signOut();
      return;
    }

    let session: StoredImpersonationSession;
    try {
      session = JSON.parse(raw);
    } catch {
      sessionStorage.removeItem(IMPERSONATION_SESSION_KEY);
      await signOut();
      return;
    }

    if (!session.tokenPair) {
      sessionStorage.removeItem(IMPERSONATION_SESSION_KEY);
      await signOut();
      return;
    }

    sessionStorage.removeItem(IMPERSONATION_SESSION_KEY);
    store.set(tokenPairState.atom, session.tokenPair);
    clearSessionLocalStorageKeys();
    reloadWithSession(session.returnPath);
  }, [store, signOut, stopImpersonationMutation]);

  const hasStoredSession = useCallback(() => {
    return sessionStorage.getItem(IMPERSONATION_SESSION_KEY) !== null;
  }, []);

  return { startImpersonating, stopImpersonating, hasStoredSession };
};
