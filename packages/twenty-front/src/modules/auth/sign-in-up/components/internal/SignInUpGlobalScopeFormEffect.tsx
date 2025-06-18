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
import { countAvailableWorkspaces } from '@/auth/utils/availableWorkspacesUtils';

export const SignInUpGlobalScopeFormEffect = () => {
  const setSignInUpStep = useSetRecoilState(signInUpStepState);
  const [searchParams, setSearchParams] = useSearchParams();
  const { setAuthTokens, loadCurrentUser } = useAuth();
  const availableWorkspaces = useRecoilValue(availableWorkspacesState);

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
  ]);

  return <></>;
};
