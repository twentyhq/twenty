import { useAuth } from '@/auth/hooks/useAuth';
import { useHasAccessTokenPair } from '@/auth/hooks/useHasAccessTokenPair';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

export const SignInUpGlobalScopeFormEffect = () => {
  const signInUpStep = useAtomStateValue(signInUpStepState);
  const [searchParams, setSearchParams] = useSearchParams();
  const { setAuthTokens, navigateAfterMultiWorkspaceSignInUp } = useAuth();
  const { loadCurrentUser } = useLoadCurrentUser();
  const hasAccessTokenPair = useHasAccessTokenPair();

  useEffect(() => {
    // Once authenticated on the central domain, route the same way credentials
    // do: no workspace -> creation step, one -> straight in, several -> select.
    const resumeOnCentralDomain = async () => {
      const { user } = await loadCurrentUser();
      await navigateAfterMultiWorkspaceSignInUp(
        user.availableWorkspaces,
        user.email,
      );
    };

    // Path 1: user just bounced back from social SSO with a workspace-agnostic
    // tokenPair in the URL. Honor it unconditionally.
    const tokenPairFromUrl = searchParams.get('tokenPair');
    if (isDefined(tokenPairFromUrl)) {
      setAuthTokens(JSON.parse(tokenPairFromUrl));
      searchParams.delete('tokenPair');
      setSearchParams(searchParams);
      void resumeOnCentralDomain();
      return;
    }

    // Path 2: user revisits /welcome with a still-valid workspace-agnostic
    // tokenPair cookie left over from a prior SSO landing. Resume instead of
    // forcing them through the sign-in form again. The step transition gates
    // re-entry; if the cookie is stale, loadCurrentUser triggers Apollo's
    // renewal -> onUnauthenticatedError path which clears the cookie and falls
    // back to the normal form.
    if (signInUpStep !== SignInUpStep.Init) return;
    if (!hasAccessTokenPair) return;

    void resumeOnCentralDomain();
  }, [
    searchParams,
    setSearchParams,
    loadCurrentUser,
    setAuthTokens,
    signInUpStep,
    hasAccessTokenPair,
    navigateAfterMultiWorkspaceSignInUp,
  ]);

  return <></>;
};
