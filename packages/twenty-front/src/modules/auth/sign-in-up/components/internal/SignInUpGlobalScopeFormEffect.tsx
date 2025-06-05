import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { useEffect } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { signInUpCallbackState } from '@/auth/states/signInUpCallbackState';
import { useAuth } from '@/auth/hooks/useAuth';
import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { useSearchParams } from 'react-router-dom';

export const SignInUpGlobalScopeFormEffect = () => {
  const setSignInUpStep = useSetRecoilState(signInUpStepState);
  const setSignInUpCallbackState = useSetRecoilState(signInUpCallbackState);
  const [searchParams, setSearchParams] = useSearchParams();
  const { getAvailableWorkspaces, setAuthTokens } = useAuth();

  const availableWorkspaces = useRecoilValue(availableWorkspacesState);

  useEffect(() => {
    const tokenPair = searchParams.get('tokenPair');
    if (isDefined(tokenPair)) {
      setAuthTokens(JSON.parse(tokenPair));
      searchParams.delete('tokenPair');
      setSearchParams(searchParams);
      getAvailableWorkspaces();
      setSignInUpStep(SignInUpStep.WorkspaceSelection);
    }
  }, [
    searchParams,
    setSearchParams,
    availableWorkspaces,
    setSignInUpStep,
    setSignInUpCallbackState,
    getAvailableWorkspaces,
    setAuthTokens,
  ]);

  return <></>;
};
