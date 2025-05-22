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

const searchParams = new URLSearchParams(window.location.search);
const signInUpCallback = searchParams.get('signInUpCallback');

export const SignInUpGlobalScopeFormEffect = () => {
  const setSignInUpStep = useSetRecoilState(signInUpStepState);
  const setSignInUpCallbackState = useSetRecoilState(signInUpCallbackState);

  const { getAvailableWorkspaces } = useAuth();

  const availableWorkspaces = useRecoilValue(availableWorkspacesState);

  useEffect(() => {
    if (isDefined(signInUpCallback) && availableWorkspaces.length === 0) {
      const signInUpCallbackData = JSON.parse(signInUpCallback);
      setSignInUpCallbackState(signInUpCallbackData);

      getAvailableWorkspaces(signInUpCallbackData.email);

      setSignInUpStep(SignInUpStep.WorkspaceSelection);
    }
  }, [
    availableWorkspaces.length,
    setSignInUpStep,
    setSignInUpCallbackState,
    signInUpCallback,
    getAvailableWorkspaces,
  ]);

  return <></>;
};
