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
import { isWorkspaceCreationLimitedToAdminsState } from '@/client-config/states/isWorkspaceCreationLimitedToAdminsState';
import { useBuildSearchParamsFromUrlSyncedStates } from '@/domain-manager/hooks/useBuildSearchParamsFromUrlSyncedStates';
import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { AppPath } from '@/types/AppPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError } from '@apollo/client';
import { useRecoilState, useRecoilValue } from 'recoil';
import { buildAppPathWithQueryParams } from '~/utils/buildAppPathWithQueryParams';
import { isMatchingLocation } from '~/utils/isMatchingLocation';
import { useAuth } from '../../hooks/useAuth';

export const useSignInUp = (form: UseFormReturn<Form>) => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const [signInUpStep, setSignInUpStep] = useRecoilState(signInUpStepState);
  const [signInUpMode, setSignInUpMode] = useRecoilState(signInUpModeState);
  const { isOnAWorkspace } = useIsCurrentLocationOnAWorkspace();

  const isWorkspaceCreationLimitedToAdmins = useRecoilValue(
    isWorkspaceCreationLimitedToAdminsState,
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
        enqueueErrorSnackBar({ apolloError: error });
      },
      onCompleted: (data) => {
        if (
          isWorkspaceCreationLimitedToAdmins &&
          !data?.checkUserExists.exists
        ) {
          enqueueErrorSnackBar({
            message: 'Workspace creation is limited to admins',
          });
          return;
        }

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
    enqueueErrorSnackBar,
    isWorkspaceCreationLimitedToAdmins,
    setSignInUpMode,
    setSignInUpStep,
  ]);

  const submitCredentials: SubmitHandler<Form> = useCallback(
    async (data) => {
      const token = await readCaptchaToken();
      try {
        if (!data.email || !data.password) {
          throw new Error('Email and password are required');
        }

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
