import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { useEffect } from 'react';
import { useSetRecoilState, useRecoilState } from 'recoil';
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

  const [availableWorkspaces, setAvailableWorkspaces] = useRecoilState(
    availableWorkspacesState,
  );

  useEffect(() => {
    if (isDefined(signInUpCallback) && availableWorkspaces.length === 0) {
      const signInUpCallbackData = JSON.parse(signInUpCallback);
      setSignInUpCallbackState(signInUpCallbackData);

      getAvailableWorkspaces(signInUpCallbackData.email);

      setSignInUpStep(SignInUpStep.WorkspaceSelection);
    }
  }, [
    availableWorkspaces.length,
    setAvailableWorkspaces,
    setSignInUpStep,
    setSignInUpCallbackState,
    getAvailableWorkspaces,
  ]);

  return <></>;
};
