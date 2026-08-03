import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { isUnauthenticatedGraphQLError } from '@/apollo/utils/isUnauthenticatedGraphQLError';
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

type CookieSessionProbeResult =
  | 'authenticated'
  | 'unauthenticated'
  | 'unreachable';

const isUnauthenticatedError = (error: unknown): boolean =>
  CombinedGraphQLErrors.is(error) &&
  error.errors.some(isUnauthenticatedGraphQLError);

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
    const probeCookieSession = async (): Promise<CookieSessionProbeResult> => {
      try {
        const result = await apolloClient.query({
          query: GetCurrentUserDocument,
          fetchPolicy: 'network-only',
          context: { skipAuthToken: true },
        });

        return isDefined(result.data?.currentUser)
          ? 'authenticated'
          : 'unauthenticated';
      } catch (error) {
        // Only the server rejecting the credential settles whether there is a
        // session. A transport failure, or a resolver blowing up for its own
        // reasons, says nothing and must not be read as one.
        return isUnauthenticatedError(error)
          ? 'unauthenticated'
          : 'unreachable';
      }
    };

    const switchToCookieAuth = () => {
      setIsCookieAuthActive(true);
      setTokenPair(null);
    };

    // Returns whether the migration reached a conclusion. Anything transient
    // returns false so the guard is released and the next renewal, which
    // changes tokenPair and re-runs this effect, tries again. Latching on an
    // attempt rather than an outcome left the tab on bearer tokens until a
    // full reload.
    const attemptCookieSessionBoot = async (): Promise<boolean> => {
      const probeResult = await probeCookieSession();

      if (probeResult === 'authenticated') {
        switchToCookieAuth();

        return true;
      }

      if (probeResult === 'unreachable') {
        return false;
      }

      if (!isDefined(tokenPair?.refreshToken?.token)) {
        return true;
      }

      if (!(await ensureTokenRenewed(store))) {
        return false;
      }

      const probeResultAfterRenewal = await probeCookieSession();

      if (probeResultAfterRenewal === 'authenticated') {
        switchToCookieAuth();

        return true;
      }

      // Renewed and still no session: the server or the browser is refusing
      // the cookie, which retrying inside this tab will not change.
      return probeResultAfterRenewal === 'unauthenticated';
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

      if (!(await attemptCookieSessionBoot())) {
        hasProbeRunRef.current = false;
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
