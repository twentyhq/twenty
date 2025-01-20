import { AppPath } from '@/types/AppPath';
import { ApolloError, useApolloClient } from '@apollo/client';
import { useCallback } from 'react';
import {
  snapshot_UNSTABLE,
  useGotoRecoilSnapshot,
  useRecoilCallback,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import { iconsState } from 'twenty-ui';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadingState';
import { isVerifyPendingState } from '@/auth/states/isVerifyPendingState';
import { workspacesState } from '@/auth/states/workspaces';
import { billingState } from '@/client-config/states/billingState';
import { captchaProviderState } from '@/client-config/states/captchaProviderState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  useChallengeMutation,
  useCheckUserExistsLazyQuery,
  useGetCurrentUserLazyQuery,
  useGetLoginTokenFromEmailVerificationTokenMutation,
  useSignUpMutation,
  useVerifyMutation,
} from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersStates';
import { isDeveloperDefaultSignInPrefilledState } from '@/client-config/states/isDeveloperDefaultSignInPrefilledState';
import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { dateTimeFormatState } from '@/localization/states/dateTimeFormatState';
import { detectDateFormat } from '@/localization/utils/detectDateFormat';
import { detectTimeFormat } from '@/localization/utils/detectTimeFormat';
import { detectTimeZone } from '@/localization/utils/detectTimeZone';
import { getDateFormatFromWorkspaceDateFormat } from '@/localization/utils/getDateFormatFromWorkspaceDateFormat';
import { getTimeFormatFromWorkspaceTimeFormat } from '@/localization/utils/getTimeFormatFromWorkspaceTimeFormat';
import { currentUserState } from '../states/currentUserState';
import { tokenPairState } from '../states/tokenPairState';

import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { BillingCheckoutSession } from '@/auth/types/billingCheckoutSession.type';
import { isEmailVerificationRequiredState } from '@/client-config/states/isEmailVerificationRequiredState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useIsCurrentLocationOnAWorkspaceSubdomain } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspaceSubdomain';
import { useLastAuthenticatedWorkspaceDomain } from '@/domain-manager/hooks/useLastAuthenticatedWorkspaceDomain';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { isAppWaitingForFreshObjectMetadataState } from '@/object-metadata/states/isAppWaitingForFreshObjectMetadataState';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { useSearchParams } from 'react-router-dom';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

export const useAuth = () => {
  const setTokenPair = useSetRecoilState(tokenPairState);
  const setCurrentUser = useSetRecoilState(currentUserState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );
  const setIsAppWaitingForFreshObjectMetadataState = useSetRecoilState(
    isAppWaitingForFreshObjectMetadataState,
  );
  const setCurrentWorkspaceMembers = useSetRecoilState(
    currentWorkspaceMembersState,
  );
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const isEmailVerificationRequired = useRecoilValue(
    isEmailVerificationRequiredState,
  );

  const setSignInUpStep = useSetRecoilState(signInUpStepState);
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
  const setIsVerifyPendingState = useSetRecoilState(isVerifyPendingState);
  const setWorkspaces = useSetRecoilState(workspacesState);
  const { redirect } = useRedirect();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();

  const [challenge] = useChallengeMutation();
  const [signUp] = useSignUpMutation();
  const [verify] = useVerifyMutation();
  const [getLoginTokenFromEmailVerificationToken] =
    useGetLoginTokenFromEmailVerificationTokenMutation();
  const [getCurrentUser] = useGetCurrentUserLazyQuery();

  const { isOnAWorkspaceSubdomain } =
    useIsCurrentLocationOnAWorkspaceSubdomain();

  const workspacePublicData = useRecoilValue(workspacePublicDataState);

  const { setLastAuthenticateWorkspaceDomain } =
    useLastAuthenticatedWorkspaceDomain();
  const [checkUserExistsQuery, { data: checkUserExistsData }] =
    useCheckUserExistsLazyQuery();

  const client = useApolloClient();

  const goToRecoilSnapshot = useGotoRecoilSnapshot();

  const setDateTimeFormat = useSetRecoilState(dateTimeFormatState);

  const [, setSearchParams] = useSearchParams();

  const clearSession = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const emptySnapshot = snapshot_UNSTABLE();
        const iconsValue = snapshot.getLoadable(iconsState).getValue();
        const authProvidersValue = snapshot
          .getLoadable(workspaceAuthProvidersState)
          .getValue();
        const billing = snapshot.getLoadable(billingState).getValue();
        const isDeveloperDefaultSignInPrefilled = snapshot
          .getLoadable(isDeveloperDefaultSignInPrefilledState)
          .getValue();
        const supportChat = snapshot.getLoadable(supportChatState).getValue();
        const isDebugMode = snapshot.getLoadable(isDebugModeState).getValue();
        const captchaProvider = snapshot
          .getLoadable(captchaProviderState)
          .getValue();
        const clientConfigApiStatus = snapshot
          .getLoadable(clientConfigApiStatusState)
          .getValue();
        const isCurrentUserLoaded = snapshot
          .getLoadable(isCurrentUserLoadedState)
          .getValue();
        const isMultiWorkspaceEnabled = snapshot
          .getLoadable(isMultiWorkspaceEnabledState)
          .getValue();
        const domainConfiguration = snapshot
          .getLoadable(domainConfigurationState)
          .getValue();
        const initialSnapshot = emptySnapshot.map(({ set }) => {
          set(iconsState, iconsValue);
          set(workspaceAuthProvidersState, authProvidersValue);
          set(billingState, billing);
          set(
            isDeveloperDefaultSignInPrefilledState,
            isDeveloperDefaultSignInPrefilled,
          );
          set(supportChatState, supportChat);
          set(isDebugModeState, isDebugMode);
          set(captchaProviderState, captchaProvider);
          set(clientConfigApiStatusState, clientConfigApiStatus);
          set(isCurrentUserLoadedState, isCurrentUserLoaded);
          set(isMultiWorkspaceEnabledState, isMultiWorkspaceEnabled);
          set(domainConfigurationState, domainConfiguration);
          return undefined;
        });
        goToRecoilSnapshot(initialSnapshot);
        await client.clearStore();
        sessionStorage.clear();
        localStorage.clear();
        // We need to explicitly clear the state to trigger the cookie deletion which include the parent domain
        setLastAuthenticateWorkspaceDomain(null);
      },
    [client, goToRecoilSnapshot, setLastAuthenticateWorkspaceDomain],
  );

  const handleChallenge = useCallback(
    async (email: string, password: string, captchaToken?: string) => {
      try {
        const challengeResult = await challenge({
          variables: {
            email,
            password,
            captchaToken,
          },
        });
        if (isDefined(challengeResult.errors)) {
          throw challengeResult.errors;
        }

        if (!challengeResult.data?.challenge) {
          throw new Error('No login token');
        }

        return challengeResult.data.challenge;
      } catch (error) {
        // TODO: Get intellisense for graphql error extensions code (codegen?)
        if (
          error instanceof ApolloError &&
          error.graphQLErrors[0]?.extensions?.code === 'EMAIL_NOT_VERIFIED'
        ) {
          setSearchParams({ email });
          setSignInUpStep(SignInUpStep.EmailVerification);
          throw error;
        }
        throw error;
      }
    },
    [challenge, setSearchParams, setSignInUpStep],
  );

  const handleGetLoginTokenFromEmailVerificationToken = useCallback(
    async (emailVerificationToken: string, captchaToken?: string) => {
      const loginTokenResult = await getLoginTokenFromEmailVerificationToken({
        variables: {
          emailVerificationToken,
          captchaToken,
        },
      });

      if (isDefined(loginTokenResult.errors)) {
        throw loginTokenResult.errors;
      }

      if (!loginTokenResult.data?.getLoginTokenFromEmailVerificationToken) {
        throw new Error('No login token');
      }

      return loginTokenResult.data.getLoginTokenFromEmailVerificationToken;
    },
    [getLoginTokenFromEmailVerificationToken],
  );

  const loadCurrentUser = useCallback(async () => {
    const currentUserResult = await getCurrentUser({
      fetchPolicy: 'network-only',
    });

    if (isDefined(currentUserResult.error)) {
      throw new Error(currentUserResult.error.message);
    }

    const user = currentUserResult.data?.currentUser;

    if (!user) {
      throw new Error('No current user result');
    }

    let workspaceMember = null;

    setCurrentUser(user);

    if (isDefined(user.workspaceMembers)) {
      const workspaceMembers = user.workspaceMembers.map((workspaceMember) => ({
        ...workspaceMember,
        colorScheme: workspaceMember.colorScheme as ColorScheme,
        locale: workspaceMember.locale ?? 'en',
      }));

      setCurrentWorkspaceMembers(workspaceMembers);
    }

    if (isDefined(user.workspaceMember)) {
      workspaceMember = {
        ...user.workspaceMember,
        colorScheme: user.workspaceMember?.colorScheme as ColorScheme,
        locale: user.workspaceMember?.locale ?? 'en',
      };

      setCurrentWorkspaceMember(workspaceMember);

      // TODO: factorize with UserProviderEffect
      setDateTimeFormat({
        timeZone:
          workspaceMember.timeZone && workspaceMember.timeZone !== 'system'
            ? workspaceMember.timeZone
            : detectTimeZone(),
        dateFormat: isDefined(user.workspaceMember.dateFormat)
          ? getDateFormatFromWorkspaceDateFormat(
              user.workspaceMember.dateFormat,
            )
          : DateFormat[detectDateFormat()],
        timeFormat: isDefined(user.workspaceMember.timeFormat)
          ? getTimeFormatFromWorkspaceTimeFormat(
              user.workspaceMember.timeFormat,
            )
          : TimeFormat[detectTimeFormat()],
      });
      dynamicActivate(workspaceMember.locale ?? 'en');
    }

    const workspace = user.currentWorkspace ?? null;

    setCurrentWorkspace(workspace);

    if (isDefined(workspace) && isOnAWorkspaceSubdomain) {
      setLastAuthenticateWorkspaceDomain({
        workspaceId: workspace.id,
        subdomain: workspace.subdomain,
      });
    }

    if (isDefined(user.workspaces)) {
      const validWorkspaces = user.workspaces
        .filter(
          ({ workspace }) => workspace !== null && workspace !== undefined,
        )
        .map((validWorkspace) => validWorkspace.workspace)
        .filter(isDefined);

      setWorkspaces(validWorkspaces);
    }
    setIsAppWaitingForFreshObjectMetadataState(true);

    return {
      user,
      workspaceMember,
      workspace,
    };
  }, [
    getCurrentUser,
    isOnAWorkspaceSubdomain,
    setCurrentUser,
    setCurrentWorkspace,
    setCurrentWorkspaceMember,
    setCurrentWorkspaceMembers,
    setDateTimeFormat,
    setIsAppWaitingForFreshObjectMetadataState,
    setLastAuthenticateWorkspaceDomain,
    setWorkspaces,
  ]);

  const handleVerify = useCallback(
    async (loginToken: string) => {
      setIsVerifyPendingState(true);

      const verifyResult = await verify({
        variables: { loginToken },
      });

      if (isDefined(verifyResult.errors)) {
        throw verifyResult.errors;
      }

      if (!verifyResult.data?.verify) {
        throw new Error('No verify result');
      }

      setTokenPair(verifyResult.data?.verify.tokens);

      await loadCurrentUser();

      setIsVerifyPendingState(false);
    },
    [setIsVerifyPendingState, verify, setTokenPair, loadCurrentUser],
  );

  const handleCrendentialsSignIn = useCallback(
    async (email: string, password: string, captchaToken?: string) => {
      const { loginToken } = await handleChallenge(
        email,
        password,
        captchaToken,
      );
      await handleVerify(loginToken.token);
    },
    [handleChallenge, handleVerify],
  );

  const handleSignOut = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const handleCredentialsSignUp = useCallback(
    async (
      email: string,
      password: string,
      workspaceInviteHash?: string,
      workspacePersonalInviteToken?: string,
      captchaToken?: string,
    ) => {
      setIsVerifyPendingState(true);

      const signUpResult = await signUp({
        variables: {
          email,
          password,
          workspaceInviteHash,
          workspacePersonalInviteToken,
          captchaToken,
          ...(workspacePublicData?.id
            ? { workspaceId: workspacePublicData.id }
            : {}),
        },
      });

      if (isDefined(signUpResult.errors)) {
        throw signUpResult.errors;
      }

      if (!signUpResult.data?.signUp) {
        throw new Error('No login token');
      }

      if (isEmailVerificationRequired) {
        setSearchParams({ email });
        setSignInUpStep(SignInUpStep.EmailVerification);
        return null;
      }

      if (isMultiWorkspaceEnabled) {
        return redirectToWorkspaceDomain(
          signUpResult.data.signUp.workspace.subdomain,
          isEmailVerificationRequired ? AppPath.SignInUp : AppPath.Verify,
          {
            ...(!isEmailVerificationRequired && {
              loginToken: signUpResult.data.signUp.loginToken.token,
            }),
            email,
          },
        );
      }

      await handleVerify(signUpResult.data?.signUp.loginToken.token);
    },
    [
      setIsVerifyPendingState,
      signUp,
      workspacePublicData,
      isMultiWorkspaceEnabled,
      handleVerify,
      setSignInUpStep,
      setSearchParams,
      isEmailVerificationRequired,
      redirectToWorkspaceDomain,
    ],
  );

  const buildRedirectUrl = useCallback(
    (
      path: string,
      params: {
        workspacePersonalInviteToken?: string;
        workspaceInviteHash?: string;
        billingCheckoutSession?: BillingCheckoutSession;
      },
    ) => {
      const url = new URL(`${REACT_APP_SERVER_BASE_URL}${path}`);
      if (isDefined(params.workspaceInviteHash)) {
        url.searchParams.set('inviteHash', params.workspaceInviteHash);
      }
      if (isDefined(params.workspacePersonalInviteToken)) {
        url.searchParams.set(
          'inviteToken',
          params.workspacePersonalInviteToken,
        );
      }
      if (isDefined(params.billingCheckoutSession)) {
        url.searchParams.set(
          'billingCheckoutSessionState',
          JSON.stringify(params.billingCheckoutSession),
        );
      }

      if (isDefined(workspacePublicData)) {
        url.searchParams.set('workspaceId', workspacePublicData.id);
      }

      return url.toString();
    },
    [workspacePublicData],
  );

  const handleGoogleLogin = useCallback(
    (params: {
      workspacePersonalInviteToken?: string;
      workspaceInviteHash?: string;
      billingCheckoutSession?: BillingCheckoutSession;
    }) => {
      redirect(buildRedirectUrl('/auth/google', params));
    },
    [buildRedirectUrl, redirect],
  );

  const handleMicrosoftLogin = useCallback(
    (params: {
      workspacePersonalInviteToken?: string;
      workspaceInviteHash?: string;
      billingCheckoutSession?: BillingCheckoutSession;
    }) => {
      redirect(buildRedirectUrl('/auth/microsoft', params));
    },
    [buildRedirectUrl, redirect],
  );

  return {
    challenge: handleChallenge,
    getLoginTokenFromEmailVerificationToken:
      handleGetLoginTokenFromEmailVerificationToken,
    verify: handleVerify,

    loadCurrentUser,

    checkUserExists: { checkUserExistsData, checkUserExistsQuery },
    clearSession,
    signOut: handleSignOut,
    signUpWithCredentials: handleCredentialsSignUp,
    signInWithCredentials: handleCrendentialsSignIn,
    signInWithGoogle: handleGoogleLogin,
    signInWithMicrosoft: handleMicrosoftLogin,
  };
};
