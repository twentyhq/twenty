import { lastAuthenticatedMethodState } from '@/auth/states/lastAuthenticatedMethodState';
import { AuthenticatedMethod } from '@/auth/types/AuthenticatedMethod.enum';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useIsCurrentLocationOnDefaultDomain } from '@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain';
import { useSignInWithDosId } from '@/auth/sign-in-up/hooks/useSignInWithDosId';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const REDIRECT_ATTEMPT_STORAGE_KEY = 'dos-id-auto-redirect-attempted-at';
// Bounces do not always land back on /welcome with an errorMessage: guard
// errors go to /verify (whose effect navigates on to /welcome dropping the
// param) and consent-cancelled lands on the bare base URL. The cooldown is
// the catch-all: any return to the welcome page within the window after an
// attempt renders the page (with the DOS ID button) instead of redirecting
// again, so neither a failing IdP nor a cancelled consent can loop.
const REDIRECT_ATTEMPT_COOLDOWN_MS = 30_000;

const wasRedirectAttemptedRecently = (): boolean => {
  const attemptedAt = sessionStorage.getItem(REDIRECT_ATTEMPT_STORAGE_KEY);

  return (
    isDefinedAttemptTimestamp(attemptedAt) &&
    Date.now() - attemptedAt < REDIRECT_ATTEMPT_COOLDOWN_MS
  );
};

const isDefinedAttemptTimestamp = (
  value: string | null,
): value is `${number}` => value !== null && !Number.isNaN(Number(value));

// When DOS ID is the only enabled sign-in transport, reaching the welcome
// page goes straight to the identity provider instead of asking the user to
// press the button. Every suppression below exists to keep a failure from
// turning into a redirect loop: an IdP bounce comes back with an
// errorMessage or via /verify, the break-glass form is requested with
// ?direct=1, an ssoExchangeToken in the hash takes the page over, any step
// past Init means a flow is already in progress, and the cooldown covers
// every other bounce path the URL-based checks cannot see.
export const SignInUpDosIdAutoRedirectEffect = () => {
  const { signInWithDosId } = useSignInWithDosId();
  const clientConfigApiStatus = useAtomStateValue(clientConfigApiStatusState);
  const authProviders = useAtomStateValue(authProvidersState);
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );
  const signInUpStep = useAtomStateValue(signInUpStepState);
  const isLogged = useIsLogged();
  const { isDefaultDomain } = useIsCurrentLocationOnDefaultDomain();
  const [searchParams] = useSearchParams();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [lastAuthenticatedMethod, setLastAuthenticatedMethod] = useAtomState(
    lastAuthenticatedMethodState,
  );

  useEffect(() => {
    if (hasRedirected) {
      return;
    }

    if (!clientConfigApiStatus.isLoadedOnce) {
      return;
    }

    if (isLogged) {
      return;
    }

    if (
      !authProviders.dosId ||
      authProviders.password ||
      authProviders.google ||
      authProviders.microsoft ||
      authProviders.sso.length > 0
    ) {
      return;
    }

    if (searchParams.has('errorMessage') || searchParams.has('direct')) {
      return;
    }

    if (window.location.hash.includes('ssoExchangeToken')) {
      return;
    }

    if (signInUpStep !== SignInUpStep.Init) {
      return;
    }

    if (wasRedirectAttemptedRecently()) {
      return;
    }

    setHasRedirected(true);
    setLastAuthenticatedMethod(AuthenticatedMethod.DOS_ID);
    sessionStorage.setItem(REDIRECT_ATTEMPT_STORAGE_KEY, String(Date.now()));

    signInWithDosId({
      action:
        isDefaultDomain && isMultiWorkspaceEnabled
          ? 'list-available-workspaces'
          : 'join-workspace',
    });
  }, [
    authProviders.dosId,
    authProviders.google,
    authProviders.microsoft,
    authProviders.password,
    authProviders.sso,
    clientConfigApiStatus.isLoadedOnce,
    hasRedirected,
    isDefaultDomain,
    isLogged,
    isMultiWorkspaceEnabled,
    lastAuthenticatedMethod,
    searchParams,
    setLastAuthenticatedMethod,
    signInUpStep,
    signInWithDosId,
  ]);

  return <></>;
};
