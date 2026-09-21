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
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// When DOS ID is the only enabled sign-in transport, reaching the welcome
// page goes straight to the identity provider instead of asking the user to
// press the button. Every suppression below exists to keep a failure from
// turning into a redirect loop: an IdP bounce comes back with an
// errorMessage, the break-glass form is requested with ?direct=1, an
// ssoExchangeToken in the hash takes the page over, and any step past Init
// means a flow is already in progress.
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

    setHasRedirected(true);

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
    isDefaultDomain,
    isLogged,
    isMultiWorkspaceEnabled,
    searchParams,
    signInUpStep,
    signInWithDosId,
  ]);

  return <></>;
};
