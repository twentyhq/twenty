import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { isPendingServerSignOutState } from '@/auth/states/isPendingServerSignOutState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { ensureTokenRenewed } from '@/auth/utils/ensureTokenRenewed';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { isCookieSessionEnabledState } from '@/client-config/states/isCookieSessionEnabledState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  GetCurrentUserDocument,
  SignOutDocument,
} from '~/generated-metadata/graphql';

// Migrates the client from the localStorage token pair onto the httpOnly
// session cookie: once a cookie-only probe authenticates, the token pair is
// dropped and the cookie is the sole credential. Legacy clients without a
// cookie get one transparently through a single token renewal (the server
// sets the cookie on renewToken), then switch on the next probe.
export const CookieSessionBootEffect = () => {
  const apolloClient = useApolloClient();
  const store = useStore();
  const { isLoadedOnce } = useAtomStateValue(clientConfigApiStatusState);
  const isCookieSessionEnabled = useAtomStateValue(isCookieSessionEnabledState);
  const [isCookieAuthActive, setIsCookieAuthActive] = useAtomState(
    isCookieAuthActiveState,
  );
  const [tokenPair, setTokenPair] = useAtomState(tokenPairState);
  // oxlint-disable-next-line twenty/no-state-useref
  const hasProbeRunRef = useRef(false);

  useEffect(() => {
    const probeCookieSession = async (): Promise<boolean> => {
      try {
        const result = await apolloClient.query({
          query: GetCurrentUserDocument,
          fetchPolicy: 'network-only',
          context: { skipAuthToken: true },
        });

        return isDefined(result.data?.currentUser);
      } catch {
        return false;
      }
    };

    const switchToCookieAuth = () => {
      setIsCookieAuthActive(true);
      setTokenPair(null);
    };

    const runCookieSessionBoot = async () => {
      if (!isLoadedOnce) {
        return;
      }

      // A previous sign-out failed to reach the server, so the httpOnly
      // session may still be alive: finish the revocation before anything
      // could probe back into it.
      if (store.get(isPendingServerSignOutState.atom)) {
        try {
          await apolloClient.mutate({ mutation: SignOutDocument });
          store.set(isPendingServerSignOutState.atom, false);
        } catch {
          // Still unreachable: keep the marker and retry on the next boot.
        }

        return;
      }

      if (!isCookieSessionEnabled) {
        // Server-side rollback: with the flag off the server no longer
        // accepts cookies, so cutover users deliberately land on the
        // sign-in screen and re-authenticate into token-pair mode.
        if (isCookieAuthActive) {
          setIsCookieAuthActive(false);
        }

        return;
      }

      if (isCookieAuthActive || hasProbeRunRef.current) {
        return;
      }

      hasProbeRunRef.current = true;

      if (await probeCookieSession()) {
        switchToCookieAuth();

        return;
      }

      if (!isDefined(tokenPair?.refreshToken?.token)) {
        return;
      }

      const wasRenewed = await ensureTokenRenewed(store);

      if (wasRenewed && (await probeCookieSession())) {
        switchToCookieAuth();
      }
    };

    void runCookieSessionBoot();
  }, [
    apolloClient,
    isCookieAuthActive,
    isCookieSessionEnabled,
    isLoadedOnce,
    setIsCookieAuthActive,
    setTokenPair,
    store,
    tokenPair,
  ]);

  return null;
};
