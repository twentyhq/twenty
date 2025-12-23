import { useCallback, useState } from 'react';
import { type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';

import { type Form } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { signInUpModeState } from '@/auth/states/signInUpModeState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { SignInUpMode } from '@/auth/types/signInUpMode';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { useCaptcha } from '@/client-config/hooks/useCaptcha';
import { useBuildSearchParamsFromUrlSyncedStates } from '@/domain-manager/hooks/useBuildSearchParamsFromUrlSyncedStates';
import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';
import { useRecoilState } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { buildAppPathWithQueryParams } from '~/utils/buildAppPathWithQueryParams';
import { isMatchingLocation } from '~/utils/isMatchingLocation';
import { useAuth } from '@/auth/hooks/useAuth';

export const useSignInUp = (form: UseFormReturn<Form>) => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  const [signInUpStep, setSignInUpStep] = useRecoilState(signInUpStepState);
  const [signInUpMode, setSignInUpMode] = useRecoilState(signInUpModeState);
  const { isOnAWorkspace } = useIsCurrentLocationOnAWorkspace();
  const { isCaptchaReady } = useCaptcha();

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

  const { readCaptchaToken } = useReadCaptchaToken();

  const { buildSearchParamsFromUrlSyncedStates } =
    useBuildSearchParamsFromUrlSyncedStates();

  const continueWithEmail = useCallback(() => {
    setSignInUpStep(SignInUpStep.Email);
  }, [setSignInUpStep]);

  const errorMsgUserAlreadyExist = t`An error occurred while checking user existence`;
  const continueWithCredentials = useCallback(async () => {
    if (!form.getValues('email')) {
      return enqueueErrorSnackBar({
        message: t`Email is required`,
      });
    }
    if (!isCaptchaReady) {
      return enqueueErrorSnackBar({
        message: t`Captcha (anti-bot check) is still loading, try again`,
      });
    }
    try {
      const token = readCaptchaToken();

      const { data, error } = await checkUserExistsQuery({
        variables: {
          email: form.getValues('email').toLowerCase().trim(),
          captchaToken: token,
        },
      });

      if (isDefined(error)) {
        return enqueueErrorSnackBar({ apolloError: error });
      }

      setSignInUpMode(
        data?.checkUserExists.exists
          ? SignInUpMode.SignIn
          : SignInUpMode.SignUp,
      );
      setSignInUpStep(SignInUpStep.Password);
    } catch {
      enqueueErrorSnackBar({ message: errorMsgUserAlreadyExist });
    }
  }, [
    readCaptchaToken,
    form,
    isCaptchaReady,
    enqueueErrorSnackBar,
    t,
    checkUserExistsQuery,
    setSignInUpMode,
    setSignInUpStep,
    errorMsgUserAlreadyExist,
  ]);

  const submitCredentials: SubmitHandler<Form> = useCallback(
    async (data) => {
      if (!data.email || !data.password) {
        throw new Error('Email and password are required');
      }

      if (!isCaptchaReady) {
        return enqueueErrorSnackBar({
          message: t`Captcha (anti-bot check) is still loading, try again`,
        });
      }

      const token = readCaptchaToken();
      try {
        if (
          !isInviteMode &&
          signInUpMode === SignInUpMode.SignIn &&
          isOnAWorkspace
        ) {
          return await signInWithCredentialsInWorkspace(
            data.email.toLowerCase().trim(),
            data.password,
            token,
          );
        }

        if (
          !isInviteMode &&
          signInUpMode === SignInUpMode.SignIn &&
          !isOnAWorkspace
        ) {
          return await signInWithCredentials(
            data.email.toLowerCase().trim(),
            data.password,
            token,
          );
        }

        if (
          !isInviteMode &&
          signInUpMode === SignInUpMode.SignUp &&
          !isOnAWorkspace
        ) {
          return await signUpWithCredentials(
            data.email.toLowerCase().trim(),
            data.password,
            token,
          );
        }

        const verifyEmailRedirectPath = buildAppPathWithQueryParams(
          AppPath.PlanRequired,
          await buildSearchParamsFromUrlSyncedStates(),
        );

        await signUpWithCredentialsInWorkspace({
          email: data.email.toLowerCase().trim(),
          password: data.password,
          workspaceInviteHash,
          workspacePersonalInviteToken,
          captchaToken: token,
          verifyEmailRedirectPath,
        });
      } catch (error: any) {
        enqueueErrorSnackBar({
          ...(error instanceof ApolloError ? { apolloError: error } : {}),
        });
      }
    },
    [
      isCaptchaReady,
      readCaptchaToken,
      signInUpMode,
      isInviteMode,
      signInWithCredentialsInWorkspace,
      signInWithCredentials,
      signUpWithCredentials,
      signUpWithCredentialsInWorkspace,
      workspaceInviteHash,
      workspacePersonalInviteToken,
      enqueueErrorSnackBar,
      buildSearchParamsFromUrlSyncedStates,
      isOnAWorkspace,
      t,
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
