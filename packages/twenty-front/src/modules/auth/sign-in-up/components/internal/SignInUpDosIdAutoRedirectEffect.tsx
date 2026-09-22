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

// Number(null) and Number('garbage') both fail the finite+window check, so
// a missing or corrupt stamp simply reads as "no recent attempt".
const wasRedirectAttemptedRecently = (): boolean => {
  const attemptedAt = Number(
    sessionStorage.getItem(REDIRECT_ATTEMPT_STORAGE_KEY),
  );

  return (
    Number.isFinite(attemptedAt) &&
    Date.now() - attemptedAt < REDIRECT_ATTEMPT_COOLDOWN_MS
  );
};

// When DOS ID is the only enabled sign-in transport, reaching the welcome
// page goes straight to the identity provider instead of asking the user to
// press the button. Every suppression below exists to keep a failure from
// turning into a redirect loop: an IdP bounce comes back with an
// errorMessage or via /verify, the break-glass form is requested with
// ?direct=1, an ssoExchangeToken in the hash takes the page over, any step
// past Init means a flow is already in progress, and the cooldown covers
// every other bounce path the URL-based checks cannot see.
type SignInUpDosIdAutoRedirectEffectProps = {
  // Workspace-scoped SSO lives in the workspace public data (not the global
  // client config, whose sso field is always empty); while it is still
  // loading the redirect waits, so a workspace with SSO configured always
  // gets its identity-provider selection page instead of being sent to
  // DOS ID.
  isWorkspacePublicDataLoading: boolean;
  hasWorkspaceSso: boolean;
};

export const SignInUpDosIdAutoRedirectEffect = ({
  isWorkspacePublicDataLoading,
  hasWorkspaceSso,
}: SignInUpDosIdAutoRedirectEffectProps) => {
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

    if (isWorkspacePublicDataLoading || hasWorkspaceSso) {
      return;
    }

    if (
      !authProviders.dosId ||
      authProviders.password ||
      authProviders.google ||
      authProviders.microsoft
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
    clientConfigApiStatus.isLoadedOnce,
    hasRedirected,
    hasWorkspaceSso,
    isDefaultDomain,
    isLogged,
    isMultiWorkspaceEnabled,
    isWorkspacePublicDataLoading,
    lastAuthenticatedMethod,
    searchParams,
    setLastAuthenticatedMethod,
    signInUpStep,
    signInWithDosId,
  ]);

  return <></>;
};
