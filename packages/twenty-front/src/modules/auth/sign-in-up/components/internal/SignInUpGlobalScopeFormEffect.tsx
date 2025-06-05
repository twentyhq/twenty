import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useAuth } from '@/auth/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';

export const SignInUpGlobalScopeFormEffect = () => {
  const setSignInUpStep = useSetRecoilState(signInUpStepState);
  const [searchParams, setSearchParams] = useSearchParams();
  const { setAuthTokens, loadCurrentUser } = useAuth();

  useEffect(() => {
    const tokenPair = searchParams.get('tokenPair');
    if (isDefined(tokenPair)) {
      setAuthTokens(JSON.parse(tokenPair));
      searchParams.delete('tokenPair');
      setSearchParams(searchParams);
      loadCurrentUser();
      setSignInUpStep(SignInUpStep.WorkspaceSelection);
    }
  }, [
    searchParams,
    setSearchParams,
    setSignInUpStep,
    loadCurrentUser,
    setAuthTokens,
  ]);

  return <></>;
};
