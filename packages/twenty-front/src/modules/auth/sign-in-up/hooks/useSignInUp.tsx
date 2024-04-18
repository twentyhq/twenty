import { useCallback, useState } from 'react';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { useGenerateCaptchaToken } from '@/auth/hooks/useGenerateCaptchaToken';
import { useNavigateAfterSignInUp } from '@/auth/sign-in-up/hooks/useNavigateAfterSignInUp.ts';
import { Form } from '@/auth/sign-in-up/hooks/useSignInUpForm.ts';
import { AppPath } from '@/types/AppPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useInsertCaptchaScript } from '~/hooks/useInsertCaptchaScript';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

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

  const isCaptchaScriptLoaded = useInsertCaptchaScript();
  const { generateCaptchaToken } = useGenerateCaptchaToken();

  const [isGeneratingCaptchaToken, setIsGeneratingCaptchaToken] =
    useState(false);

  const getCaptchaToken = useCallback(async () => {
    setIsGeneratingCaptchaToken(true);
    try {
      const captchaToken = await generateCaptchaToken(isCaptchaScriptLoaded);
      if (!isUndefinedOrNull(captchaToken)) {
        form.setValue('captchaToken', captchaToken);
      }
      return captchaToken;
    } catch (error) {
      console.error('Failed to generate captcha token:', error);
      enqueueSnackBar(
        'You were identified as a bot by Cloudflare. Please try again.',
        {
          variant: 'error',
        },
      );
      return null;
    } finally {
      setIsGeneratingCaptchaToken(false);
    }
  }, [form, generateCaptchaToken, isCaptchaScriptLoaded, enqueueSnackBar]);

  const continueWithEmail = useCallback(() => {
    setSignInUpStep(SignInUpStep.Email);
    setSignInUpMode(
      isMatchingLocation(AppPath.SignInUp)
        ? SignInUpMode.SignIn
        : SignInUpMode.SignUp,
    );
  }, [setSignInUpStep, setSignInUpMode, isMatchingLocation]);

  const continueWithCredentials = useCallback(() => {
    if (!form.getValues('email')) {
      return;
    }
    checkUserExistsQuery({
      variables: {
        email: form.getValues('email').toLowerCase().trim(),
        captchaToken: form.getValues('captchaToken'),
      },
      onCompleted: (data) => {
        if (data?.checkUserExists.exists) {
          setSignInUpMode(SignInUpMode.SignIn);
        } else {
          setSignInUpMode(SignInUpMode.SignUp);
        }
        setSignInUpStep(SignInUpStep.Password);
      },
    });
  }, [form, checkUserExistsQuery]);

  const submitCredentials: SubmitHandler<Form> = useCallback(
    async (data) => {
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
                data.captchaToken,
              )
            : await signUpWithCredentials(
                data.email.toLowerCase().trim(),
                data.password,
                workspaceInviteHash,
                data.captchaToken,
              );

        navigateAfterSignInUp(currentWorkspace, currentWorkspaceMember);
      } catch (err: any) {
        enqueueSnackBar(err?.message, {
          variant: 'error',
        });
      }
    },
    [
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
    getCaptchaToken,
    isGeneratingCaptchaToken,
  };
};
