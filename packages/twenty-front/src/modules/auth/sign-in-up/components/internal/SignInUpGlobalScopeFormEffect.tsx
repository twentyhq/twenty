import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useAuth } from '@/auth/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import {
  countAvailableWorkspaces,
  getAvailableWorkspacePathAndSearchParams,
} from '@/auth/utils/availableWorkspacesUtils';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';

export const SignInUpGlobalScopeFormEffect = () => {
  const setSignInUpStep = useSetRecoilState(signInUpStepState);
  const [searchParams, setSearchParams] = useSearchParams();
  const { setAuthTokens, loadCurrentUser } = useAuth();
  const availableWorkspaces = useRecoilValue(availableWorkspacesState);
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();

  useEffect(() => {
    const tokenPair = searchParams.get('tokenPair');
    if (isDefined(tokenPair)) {
      setAuthTokens(JSON.parse(tokenPair));
      searchParams.delete('tokenPair');
      setSearchParams(searchParams);
      loadCurrentUser();
    }

    if (countAvailableWorkspaces(availableWorkspaces) > 1) {
      setSignInUpStep(SignInUpStep.WorkspaceSelection);
    }
  }, [
    searchParams,
    setSearchParams,
    setSignInUpStep,
    loadCurrentUser,
    setAuthTokens,
    availableWorkspaces,
    redirectToWorkspaceDomain,
  ]);

  return <></>;
};
