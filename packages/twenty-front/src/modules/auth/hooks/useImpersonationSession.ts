import { useCallback } from 'react';
import { useStore } from 'jotai';

import { useAuth } from '@/auth/hooks/useAuth';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { type AuthTokenPair } from '~/generated-metadata/graphql';

const IMPERSONATION_SESSION_KEY = 'impersonation_original_session';

type StoredImpersonationSession = {
  tokenPair: AuthTokenPair;
  returnPath: string;
};

// Token swaps without a full reload would require enumerating every
// user-scoped atom, localStorage entry, and Apollo cache key — brittle and
// silently broken every time a new piece of user state is added. Instead,
// set the cookie-backed token pair and let the browser re-bootstrap the app.
const reloadWithSession = (returnPath: string) => {
  window.location.assign(returnPath);
};

export const useImpersonationSession = () => {
  const store = useStore();
  const { getAuthTokensFromLoginToken, signOut } = useAuth();

  const startImpersonating = useCallback(
    async (loginToken: string, returnPath?: string) => {
      const currentTokenPair = store.get(tokenPairState.atom);
      const targetPath = returnPath ?? window.location.pathname;

      if (currentTokenPair) {
        const session: StoredImpersonationSession = {
          tokenPair: currentTokenPair,
          returnPath: targetPath,
        };
        sessionStorage.setItem(
          IMPERSONATION_SESSION_KEY,
          JSON.stringify(session),
        );
      }

      await getAuthTokensFromLoginToken(loginToken);
      reloadWithSession(targetPath);
    },
    [store, getAuthTokensFromLoginToken],
  );

  const stopImpersonating = useCallback(async () => {
    const raw = sessionStorage.getItem(IMPERSONATION_SESSION_KEY);

    if (!raw) {
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

    sessionStorage.removeItem(IMPERSONATION_SESSION_KEY);
    store.set(tokenPairState.atom, session.tokenPair);
    reloadWithSession(session.returnPath);
  }, [store, signOut]);

  const hasStoredSession = useCallback(() => {
    return sessionStorage.getItem(IMPERSONATION_SESSION_KEY) !== null;
  }, []);

  return { startImpersonating, stopImpersonating, hasStoredSession };
};
