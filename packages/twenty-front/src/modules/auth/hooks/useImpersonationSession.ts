import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

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
        // Drop the token pair the exchange also returned, so the cookie it set stays
        // the only credential.
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
      let parkedTokenPair: AuthTokenPair | undefined;

      if (raw !== null) {
        sessionStorage.removeItem(IMPERSONATION_SESSION_KEY);
        try {
          const session = JSON.parse(raw) as StoredImpersonationSession;

          returnPath = session.returnPath;
          parkedTokenPair = session.tokenPair;
        } catch {}
      }

      try {
        const { data } = await stopImpersonationMutation();

        if (data?.stopImpersonation.canRestoreImpersonatorSession === true) {
          store.set(tokenPairState.atom, null);
          clearSessionLocalStorageKeys();
          reloadWithSession(returnPath);

          return;
        }
      } catch {}

      // The server had no impersonator session to hand back, and it cleared the
      // session cookie on its way out. startImpersonating parked the token pair
      // it dropped, so hand that back: it is the same credential the admin held
      // before impersonating, and signing them out of it instead would end a
      // session that is still valid. Cookie auth goes off with it, otherwise the
      // auth link keeps suppressing the Bearer and the tab is left holding no
      // credential at all.
      if (isDefined(parkedTokenPair)) {
        store.set(isCookieAuthActiveState.atom, false);
        store.set(tokenPairState.atom, parkedTokenPair);
        clearSessionLocalStorageKeys();
        reloadWithSession(returnPath);

        return;
      }

      // Cross-workspace: the admin session on its own origin was never replaced,
      // and this origin never held one to park.
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
