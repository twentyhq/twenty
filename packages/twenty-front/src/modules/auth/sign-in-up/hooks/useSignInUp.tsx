import { useCallback, useState } from 'react';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import { useParams, useSearchParams } from 'react-router-dom';

import { Form } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { isDefined } from '~/utils/isDefined';

import { useAuth } from '../../hooks/useAuth';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { useSSO } from '@/auth/sign-in-up/hooks/useSSO';
import { availableSSOIdentityProvidersState } from '@/auth/states/availableWorkspacesForSSO';

export enum SignInUpMode {
  SignIn = 'sign-in',
  SignUp = 'sign-up',
}

export const useSignInUp = (form: UseFormReturn<Form>) => {
  const { enqueueSnackBar } = useSnackBar();

  const [signInUpStep, setSignInUpStep] = useRecoilState(signInUpStepState);

  const isMatchingLocation = useIsMatchingLocation();

  const { redirectToSSOLoginPage, findAvailableSSOProviderByEmail } = useSSO();
  const setAvailableWorkspacesForSSOState = useSetRecoilState(
    availableSSOIdentityProvidersState,
  );

  const workspaceInviteHash = useParams().workspaceInviteHash;
  const [searchParams] = useSearchParams();
  const workspacePersonalInviteToken =
    searchParams.get('inviteToken') ?? undefined;

  const [isInviteMode] = useState(() => isMatchingLocation(AppPath.Invite));

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

  const { requestFreshCaptchaToken } = useRequestFreshCaptchaToken();
  const { readCaptchaToken } = useReadCaptchaToken();

  const continueWithEmail = useCallback(() => {
    requestFreshCaptchaToken();
    setSignInUpStep(SignInUpStep.Email);
    setSignInUpMode(
      isMatchingLocation(AppPath.SignInUp)
        ? SignInUpMode.SignIn
        : SignInUpMode.SignUp,
    );
  }, [isMatchingLocation, requestFreshCaptchaToken, setSignInUpStep]);

  const continueWithCredentials = useCallback(async () => {
    const token = await readCaptchaToken();
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
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: (data) => {
        requestFreshCaptchaToken();
        if (data?.checkUserExists.exists) {
          setSignInUpMode(SignInUpMode.SignIn);
        } else {
          setSignInUpMode(SignInUpMode.SignUp);
        }
        setSignInUpStep(SignInUpStep.Password);
      },
    });
  }, [
    readCaptchaToken,
    form,
    checkUserExistsQuery,
    enqueueSnackBar,
    requestFreshCaptchaToken,
    setSignInUpStep,
  ]);

  const continueWithSSO = () => {
    setSignInUpStep(SignInUpStep.SSOEmail);
  };

  const submitSSOEmail = async (email: string) => {
    const result = await findAvailableSSOProviderByEmail({
      email,
    });

    if (isDefined(result.errors)) {
      return enqueueSnackBar(result.errors[0].message, {
        variant: SnackBarVariant.Error,
      });
    }

    if (
      !result.data?.findAvailableSSOIdentityProviders ||
      result.data?.findAvailableSSOIdentityProviders.length === 0
    ) {
      enqueueSnackBar('No workspaces with SSO found', {
        variant: SnackBarVariant.Error,
      });
      return;
    }
    // If only one workspace, redirect to SSO
    if (result.data?.findAvailableSSOIdentityProviders.length === 1) {
      return redirectToSSOLoginPage(
        result.data.findAvailableSSOIdentityProviders[0].id,
      );
    }

    if (result.data?.findAvailableSSOIdentityProviders.length > 1) {
      setAvailableWorkspacesForSSOState(
        result.data.findAvailableSSOIdentityProviders,
      );
      setSignInUpStep(SignInUpStep.SSOWorkspaceSelection);
    }
  };

  const submitCredentials: SubmitHandler<Form> = useCallback(
    async (data) => {
      const token = await readCaptchaToken();
      try {
        if (!data.email || !data.password) {
          throw new Error('Email and password are required');
        }

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
              workspacePersonalInviteToken,
              token,
            );
      } catch (err: any) {
        enqueueSnackBar(err?.message, {
          variant: SnackBarVariant.Error,
        });
        requestFreshCaptchaToken();
      }
    },
    [
      readCaptchaToken,
      signInUpMode,
      isInviteMode,
      signInWithCredentials,
      signUpWithCredentials,
      workspaceInviteHash,
      workspacePersonalInviteToken,
      enqueueSnackBar,
      requestFreshCaptchaToken,
    ],
  );

  return {
    isInviteMode,
    signInUpStep,
    signInUpMode,
    continueWithCredentials,
    continueWithEmail,
    continueWithSSO,
    submitSSOEmail,
    submitCredentials,
  };
};
