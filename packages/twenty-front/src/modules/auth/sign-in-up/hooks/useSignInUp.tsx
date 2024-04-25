import { useCallback, useState } from 'react';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { useNavigateAfterSignInUp } from '@/auth/sign-in-up/hooks/useNavigateAfterSignInUp';
import { Form } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { useCaptchaToken } from '@/captcha/hooks/useCaptchaToken';
import { AppPath } from '@/types/AppPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

import { useAuth } from '../../hooks/useAuth';

export enum SignInUpMode {
  SignIn = 'sign-in',
  SignUp = 'sign-up',
}

export enum SignInUpStep {
  Init = 'init',
  Email = 'email',
  Password = 'password',
}

export const useSignInUp = (form: UseFormReturn<Form>) => {
  const { enqueueSnackBar } = useSnackBar();

  const isMatchingLocation = useIsMatchingLocation();

  const workspaceInviteHash = useParams().workspaceInviteHash;

  const { navigateAfterSignInUp } = useNavigateAfterSignInUp();

  const [isInviteMode] = useState(() => isMatchingLocation(AppPath.Invite));

  const [signInUpStep, setSignInUpStep] = useState<SignInUpStep>(
    SignInUpStep.Init,
  );

  const [signInUpMode, setSignInUpMode] = useState<SignInUpMode>(() => {
    return isMatchingLocation(AppPath.SignInUp)
      ? SignInUpMode.SignIn
      : SignInUpMode.SignUp;
  });

  const {
    signInWithCredentials,
    signUpWithCredentials,
    checkUserExists: { checkUserExistsQuery },
  } = useAuth();

  const { preloadFreshCaptchaToken, getPreloadedOrFreshCaptchaToken } =
    useCaptchaToken();

  const continueWithEmail = useCallback(() => {
    preloadFreshCaptchaToken();
    setSignInUpStep(SignInUpStep.Email);
    setSignInUpMode(
      isMatchingLocation(AppPath.SignInUp)
        ? SignInUpMode.SignIn
        : SignInUpMode.SignUp,
    );
  }, [isMatchingLocation, preloadFreshCaptchaToken]);

  const continueWithCredentials = useCallback(async () => {
    const token = await getPreloadedOrFreshCaptchaToken();
    if (!form.getValues('email')) {
      return;
    }
    checkUserExistsQuery({
      variables: {
        email: form.getValues('email').toLowerCase().trim(),
        captchaToken: token,
      },
      onError: (error) => {
        enqueueSnackBar(`${error.message}`, {
          variant: 'error',
        });
      },
      onCompleted: (data) => {
        preloadFreshCaptchaToken();
        if (data?.checkUserExists.exists) {
          setSignInUpMode(SignInUpMode.SignIn);
        } else {
          setSignInUpMode(SignInUpMode.SignUp);
        }
        setSignInUpStep(SignInUpStep.Password);
      },
    });
  }, [
    getPreloadedOrFreshCaptchaToken,
    form,
    checkUserExistsQuery,
    enqueueSnackBar,
    preloadFreshCaptchaToken,
  ]);

  const submitCredentials: SubmitHandler<Form> = useCallback(
    async (data) => {
      const token = await getPreloadedOrFreshCaptchaToken();
      try {
        if (!data.email || !data.password) {
          throw new Error('Email and password are required');
        }

        const {
          workspace: currentWorkspace,
          workspaceMember: currentWorkspaceMember,
        } =
          signInUpMode === SignInUpMode.SignIn && !isInviteMode
            ? await signInWithCredentials(
                data.email.toLowerCase().trim(),
                data.password,
                token,
              )
            : await signUpWithCredentials(
                data.email.toLowerCase().trim(),
                data.password,
                workspaceInviteHash,
                token,
              );

        navigateAfterSignInUp(currentWorkspace, currentWorkspaceMember);
      } catch (err: any) {
        enqueueSnackBar(err?.message, {
          variant: 'error',
        });
      }
    },
    [
      getPreloadedOrFreshCaptchaToken,
      signInUpMode,
      isInviteMode,
      signInWithCredentials,
      signUpWithCredentials,
      workspaceInviteHash,
      navigateAfterSignInUp,
      enqueueSnackBar,
    ],
  );

  return {
    isInviteMode,
    signInUpStep,
    signInUpMode,
    continueWithCredentials,
    continueWithEmail,
    submitCredentials,
  };
};
