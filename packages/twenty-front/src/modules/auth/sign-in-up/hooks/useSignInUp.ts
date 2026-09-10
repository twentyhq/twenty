import { useCallback, useState } from 'react';
import { type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { type Form } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { lastAuthenticatedMethodState } from '@/auth/states/lastAuthenticatedMethodState';
import { signInUpModeState } from '@/auth/states/signInUpModeState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { AuthenticatedMethod } from '@/auth/types/AuthenticatedMethod.enum';
import { SignInUpMode } from '@/auth/types/signInUpMode';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { useCaptcha } from '@/client-config/hooks/useCaptcha';
import { useBuildSearchParamsFromUrlSyncedStates } from '@/domain-manager/hooks/useBuildSearchParamsFromUrlSyncedStates';
import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';
import { buildAppPathWithQueryParams } from '~/utils/buildAppPathWithQueryParams';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const useSignInUp = (form: UseFormReturn<Form>) => {
  const { enqueueToast } = useToast();
  const { enqueueErrorToast } = useErrorToast();
  const { t } = useLingui();

  const [signInUpStep, setSignInUpStep] = useAtomState(signInUpStepState);
  const [signInUpMode, setSignInUpMode] = useAtomState(signInUpModeState);
  const { isOnAWorkspace } = useIsCurrentLocationOnAWorkspace();
  const workspacePublicData = useAtomStateValue(workspacePublicDataState);
  const { isCaptchaReady } = useCaptcha();
  const setLastAuthenticatedMethod = useSetAtomState(
    lastAuthenticatedMethodState,
  );

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
      return enqueueToast({ variant: 'error', children: t`Email is required` });
    }
    if (!isCaptchaReady) {
      return enqueueToast({
        variant: 'error',
        children: t`Captcha (anti-bot check) is still loading, try again`,
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
        return enqueueErrorToast(error);
      }

      setSignInUpMode(
        data?.checkUserExists.exists
          ? SignInUpMode.SignIn
          : SignInUpMode.SignUp,
      );
      setSignInUpStep(SignInUpStep.Password);
    } catch {
      enqueueToast({ variant: 'error', children: errorMsgUserAlreadyExist });
    }
  }, [
    readCaptchaToken,
    form,
    isCaptchaReady,
    enqueueToast,
    enqueueErrorToast,
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
        return enqueueToast({
          variant: 'error',
          children: t`Captcha (anti-bot check) is still loading, try again`,
        });
      }

      const token = readCaptchaToken();
      try {
        setLastAuthenticatedMethod(AuthenticatedMethod.EMAIL);

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
          (!isOnAWorkspace || !isDefined(workspacePublicData))
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
      } catch (error: unknown) {
        enqueueErrorToast(error);
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
      enqueueToast,
      enqueueErrorToast,
      buildSearchParamsFromUrlSyncedStates,
      isOnAWorkspace,
      workspacePublicData,
      setLastAuthenticatedMethod,
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
