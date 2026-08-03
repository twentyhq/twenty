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
// session cookie. Clients without a cookie get one through a single token
// renewal, which the server sets on renewToken, then switch on the next probe.
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
        // Only the server rejecting the credential settles this. A transport
        // failure, or a resolver failing for its own reasons, says nothing.
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
    // returns false, releasing the guard so the next renewal retries.
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

      // Renewed and still no session: something is refusing the cookie, which
      // retrying in this tab will not change.
      return probeResultAfterRenewal === 'unauthenticated';
    };

    const runCookieSessionBoot = async () => {
      if (!isLoadedOnce) {
        return;
      }

      // A previous sign-out never reached the server, so finish the revocation
      // before anything can probe back into a live session.
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
        // Server-side rollback: cutover users land on the sign-in screen and
        // re-authenticate into token-pair mode.
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
