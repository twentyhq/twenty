import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

const searchParams = new URLSearchParams(window.location.search);
const email = searchParams.get('email');

export const SignInUpWorkspaceScopeFormEffect = () => {
  const workspaceAuthProviders = useAtomStateValue(workspaceAuthProvidersState);

  const { form } = useSignInUpForm();

  const { signInUpStep, continueWithEmail, continueWithCredentials } =
    useSignInUp(form);

  const setSignInUpStep = useSetAtomState(signInUpStepState);

  useEffect(() => {
    if (!workspaceAuthProviders) {
      return;
    }

    const hasOnlySsoProvidersEnabled =
      !workspaceAuthProviders.google &&
      !workspaceAuthProviders.microsoft &&
      !workspaceAuthProviders.password;

    if (hasOnlySsoProvidersEnabled && workspaceAuthProviders.sso.length > 1) {
      return setSignInUpStep(SignInUpStep.SsoIdentityProviderSelection);
    }
  }, [setSignInUpStep, workspaceAuthProviders]);

  useEffect(() => {
    if (!workspaceAuthProviders) {
      return;
    }

    if (
      signInUpStep === SignInUpStep.Init &&
      !workspaceAuthProviders.google &&
      !workspaceAuthProviders.microsoft &&
      workspaceAuthProviders.sso.length === 0
    ) {
      continueWithEmail();
      return;
    }

    if (
      signInUpStep !== SignInUpStep.Password &&
      signInUpStep !== SignInUpStep.Email &&
      isDefined(email) &&
      workspaceAuthProviders.password
    ) {
      continueWithCredentials();
    }
  }, [
    signInUpStep,
    workspaceAuthProviders,
    continueWithEmail,
    continueWithCredentials,
  ]);

  return <></>;
};
