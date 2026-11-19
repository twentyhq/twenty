import { useCallback, useState } from 'react';
import { type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';

import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { useAuth } from '@/auth/hooks/useAuth';
import { type Form } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { lastAuthenticatedMethodState } from '@/auth/states/lastAuthenticatedMethodState';
import { signInUpModeState } from '@/auth/states/signInUpModeState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { AuthenticatedMethod } from '@/auth/types/AuthenticatedMethod';
import { SignInUpMode } from '@/auth/types/SignInUpMode';
import { useGetCaptchaToken } from '@/captcha/hooks/useGetCaptchaToken';
import { useBuildSearchParamsFromUrlSyncedStates } from '@/domain-manager/hooks/useBuildSearchParamsFromUrlSyncedStates';
import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { buildAppPathWithQueryParams } from '~/utils/buildAppPathWithQueryParams';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const useSignInUp = (form: UseFormReturn<Form>) => {
  const { enqueueToast } = useToast();
  const { t } = useLingui();

  const [signInUpStep, setSignInUpStep] = useAtomState(signInUpStepState);
  const [signInUpMode, setSignInUpMode] = useAtomState(signInUpModeState);
  const { isOnAWorkspace } = useIsCurrentLocationOnAWorkspace();
  const workspacePublicData = useAtomStateValue(workspacePublicDataState);
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

  const { getCaptchaToken } = useGetCaptchaToken();

  const { buildSearchParamsFromUrlSyncedStates } =
    useBuildSearchParamsFromUrlSyncedStates();

  const continueWithEmail = useCallback(() => {
    setSignInUpStep(SignInUpStep.Email);
  }, [setSignInUpStep]);

  const userExistenceCheckErrorMessage = t`An error occurred while checking user existence`;
  const continueWithCredentials = useCallback(async () => {
    if (!form.getValues('email')) {
      return enqueueToast({ status: 'error', children: t`Email is required` });
    }
    try {
      const token = await getCaptchaToken();

      const { data, error } = await checkUserExistsQuery({
        variables: {
          email: form.getValues('email').toLowerCase().trim(),
          captchaToken: token,
        },
      });

      if (isDefined(error)) {
        return enqueueToast(getToastOptionsFromError({ error }));
      }

      setSignInUpMode(
        data?.checkUserExists.exists
          ? SignInUpMode.SignIn
          : SignInUpMode.SignUp,
      );
      setSignInUpStep(SignInUpStep.Password);
    } catch (error) {
      enqueueToast(
        CombinedGraphQLErrors.is(error)
          ? getToastOptionsFromError({ error })
          : { status: 'error', children: userExistenceCheckErrorMessage },
      );
    }
  }, [
    getCaptchaToken,
    form,
    enqueueToast,
    t,
    checkUserExistsQuery,
    setSignInUpMode,
    setSignInUpStep,
    userExistenceCheckErrorMessage,
  ]);

  const submitCredentials: SubmitHandler<Form> = useCallback(
    async (data) => {
      if (!data.email || !data.password) {
        throw new Error(t`Email and password are required`);
      }

      try {
        const token = await getCaptchaToken();

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
        enqueueToast(getToastOptionsFromError({ error }));
      }
    },
    [
      getCaptchaToken,
      signInUpMode,
      isInviteMode,
      signInWithCredentialsInWorkspace,
      signInWithCredentials,
      signUpWithCredentials,
      signUpWithCredentialsInWorkspace,
      workspaceInviteHash,
      workspacePersonalInviteToken,
      enqueueToast,
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
