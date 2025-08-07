import { useAuth } from '@/auth/hooks/useAuth';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const SignInUpGlobalScopeFormEffect = () => {
  const setSignInUpStep = useSetRecoilState(signInUpStepState);
  const [searchParams, setSearchParams] = useSearchParams();
  const { setAuthTokens } = useAuth();
  const { loadCurrentUser } = useLoadCurrentUser();

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
