import { useCallback, useState } from 'react';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';

import { Form } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { signInUpModeState } from '@/auth/states/signInUpModeState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { SignInUpMode } from '@/auth/types/signInUpMode';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { useBuildSearchParamsFromUrlSyncedStates } from '@/domain-manager/hooks/useBuildSearchParamsFromUrlSyncedStates';
import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilState } from 'recoil';
import { buildAppPathWithQueryParams } from '~/utils/buildAppPathWithQueryParams';
import { isMatchingLocation } from '~/utils/isMatchingLocation';
import { useAuth } from '../../hooks/useAuth';
import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';

export const useSignInUp = (form: UseFormReturn<Form>) => {
  const { enqueueSnackBar } = useSnackBar();

  const [signInUpStep, setSignInUpStep] = useRecoilState(signInUpStepState);
  const [signInUpMode, setSignInUpMode] = useRecoilState(signInUpModeState);
  const { isOnAWorkspace } = useIsCurrentLocationOnAWorkspace();

  const location = useLocation();

  const workspaceInviteHash = useParams().workspaceInviteHash;
  const [searchParams] = useSearchParams();
  const workspacePersonalInviteToken =
    searchParams.get('inviteToken') ?? undefined;

  const [isInviteMode] = useState(() =>
    isMatchingLocation(location, AppPath.Invite),
  );

  const {
    signInWithCredentialsInWorkspace,
    signInWithCredentials,
    signUpWithCredentialsInWorkspace,
    signUpWithCredentials,
    checkUserExists: { checkUserExistsQuery },
  } = useAuth();

  const { requestFreshCaptchaToken } = useRequestFreshCaptchaToken();
  const { readCaptchaToken } = useReadCaptchaToken();

  const { buildSearchParamsFromUrlSyncedStates } =
    useBuildSearchParamsFromUrlSyncedStates();

  const continueWithEmail = useCallback(() => {
    requestFreshCaptchaToken();
    setSignInUpStep(SignInUpStep.Email);
  }, [requestFreshCaptchaToken, setSignInUpStep]);

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
        setSignInUpMode(
          data?.checkUserExists.exists
            ? SignInUpMode.SignIn
            : SignInUpMode.SignUp,
        );
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
    setSignInUpMode,
  ]);

  const submitCredentials: SubmitHandler<Form> = useCallback(
    async (data) => {
      const token = await readCaptchaToken();
      try {
        if (!data.email || !data.password) {
          throw new Error('Email and password are required');
        }

        if (
          signInUpMode === SignInUpMode.SignIn &&
          !isInviteMode &&
          isOnAWorkspace
        ) {
          return await signInWithCredentialsInWorkspace(
            data.email.toLowerCase().trim(),
            data.password,
            token,
          );
        }

        if (signInUpMode === SignInUpMode.SignIn && !isOnAWorkspace) {
          return await signInWithCredentials(
            data.email.toLowerCase().trim(),
            data.password,
            token,
          );
        }

        if (signInUpMode === SignInUpMode.SignUp && !isOnAWorkspace) {
          return await signUpWithCredentials(
            data.email.toLowerCase().trim(),
            data.password,
            token,
          );
        }

        const verifyEmailNextPath = buildAppPathWithQueryParams(
          AppPath.PlanRequired,
          await buildSearchParamsFromUrlSyncedStates(),
        );

        await signUpWithCredentialsInWorkspace({
          email: data.email.toLowerCase().trim(),
          password: data.password,
          workspaceInviteHash,
          workspacePersonalInviteToken,
          captchaToken: token,
          verifyEmailNextPath,
        });
      } catch (err: any) {
        enqueueSnackBar(err?.message, {
          variant: SnackBarVariant.Error,
        });
      } finally {
        requestFreshCaptchaToken();
      }
    },
    [
      readCaptchaToken,
      signInUpMode,
      isInviteMode,
      signInWithCredentialsInWorkspace,
      signInWithCredentials,
      signUpWithCredentialsInWorkspace,
      workspaceInviteHash,
      workspacePersonalInviteToken,
      enqueueSnackBar,
      requestFreshCaptchaToken,
      buildSearchParamsFromUrlSyncedStates,
      isOnAWorkspace,
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
