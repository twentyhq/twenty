import { CombinedGraphQLErrors } from '@apollo/client/errors';
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

type CookieSessionProbeResult =
  | 'authenticated'
  | 'unauthenticated'
  | 'unreachable';

// A request with no credential at all is refused as FORBIDDEN, while an
// invalid one is UNAUTHENTICATED, and guards that throw before the code is
// attached surface a bare "Unauthorized". The probe deliberately sends no
// credential, so it has to recognise all three or the migration never starts.
const AUTH_REFUSAL_CODES = new Set(['UNAUTHENTICATED', 'FORBIDDEN']);

const isAuthRefusal = (error: unknown): boolean =>
  CombinedGraphQLErrors.is(error) &&
  error.errors.some(
    (graphQLError) =>
      AUTH_REFUSAL_CODES.has(String(graphQLError.extensions?.code)) ||
      graphQLError.message === 'Unauthorized',
  );

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
        return isAuthRefusal(error) ? 'unauthenticated' : 'unreachable';
      }
    };

    const switchToCookieAuth = () => {
      setIsCookieAuthActive(true);
      setTokenPair(null);
    };

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

      return probeResultAfterRenewal === 'unauthenticated';
    };

    const runCookieSessionBoot = async () => {
      if (!isLoadedOnce) {
        return;
      }

      if (store.get(isPendingServerSignOutState.atom)) {
        try {
          await apolloClient.mutate({ mutation: SignOutDocument });
          store.set(isPendingServerSignOutState.atom, false);
        } catch {}

        return;
      }

      if (!isCookieSessionEnabled) {
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
