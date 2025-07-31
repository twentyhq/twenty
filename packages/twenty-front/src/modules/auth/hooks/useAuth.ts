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

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  AuthTokenPair,
  useCheckUserExistsLazyQuery,
  useGetAuthTokensFromLoginTokenMutation,
  useGetAuthTokensFromOtpMutation,
  useGetCurrentUserLazyQuery,
  useGetLoginTokenFromCredentialsMutation,
  useGetLoginTokenFromEmailVerificationTokenMutation,
  useGetWorkspaceAgnosticTokenFromEmailVerificationTokenMutation,
  useSignInMutation,
  useSignUpInWorkspaceMutation,
  useSignUpMutation,
} from '~/generated-metadata/graphql';

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

import { useSignUpInNewWorkspace } from '@/auth/sign-in-up/hooks/useSignUpInNewWorkspace';
import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { BillingCheckoutSession } from '@/auth/types/billingCheckoutSession.type';
import {
  countAvailableWorkspaces,
  getFirstAvailableWorkspaces,
} from '@/auth/utils/availableWorkspacesUtils';
import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { apiConfigState } from '@/client-config/states/apiConfigState';
import { captchaState } from '@/client-config/states/captchaState';
import { isEmailVerificationRequiredState } from '@/client-config/states/isEmailVerificationRequiredState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { sentryConfigState } from '@/client-config/states/sentryConfigState';
import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { useLastAuthenticatedWorkspaceDomain } from '@/domain-manager/hooks/useLastAuthenticatedWorkspaceDomain';
import { useOrigin } from '@/domain-manager/hooks/useOrigin';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItem';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { i18n } from '@lingui/core';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { iconsState } from 'twenty-ui/display';
import { AuthToken } from '~/generated/graphql';
import { cookieStorage } from '~/utils/cookie-storage';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';
import { loginTokenState } from '../states/loginTokenState';

export const useAuth = () => {
  const setTokenPair = useSetRecoilState(tokenPairState);
  const setLoginToken = useSetRecoilState(loginTokenState);
  const setCurrentUser = useSetRecoilState(currentUserState);
  const setAvailableWorkspaces = useSetRecoilState(availableWorkspacesState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );
  const setCurrentUserWorkspace = useSetRecoilState(currentUserWorkspaceState);
  const { origin } = useOrigin();
  const { requestFreshCaptchaToken } = useRequestFreshCaptchaToken();
  const setCurrentWorkspaceMembers = useSetRecoilState(
    currentWorkspaceMembersState,
  );
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const isEmailVerificationRequired = useRecoilValue(
    isEmailVerificationRequiredState,
  );

  const { refreshObjectMetadataItems } = useRefreshObjectMetadataItems();
  const { createWorkspace } = useSignUpInNewWorkspace();

  const setSignInUpStep = useSetRecoilState(signInUpStepState);
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
  const { redirect } = useRedirect();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();

  const [getLoginTokenFromCredentials] =
    useGetLoginTokenFromCredentialsMutation();
  const [signIn] = useSignInMutation();
  const [signUp] = useSignUpMutation();
  const [signUpInWorkspace] = useSignUpInWorkspaceMutation();
  const [getAuthTokensFromLoginToken] =
    useGetAuthTokensFromLoginTokenMutation();
  const [getLoginTokenFromEmailVerificationToken] =
    useGetLoginTokenFromEmailVerificationTokenMutation();
  const [getWorkspaceAgnosticTokenFromEmailVerificationToken] =
    useGetWorkspaceAgnosticTokenFromEmailVerificationTokenMutation();
  const [getCurrentUser] = useGetCurrentUserLazyQuery();
  const [getAuthTokensFromOtp] = useGetAuthTokensFromOtpMutation();

  const { isOnAWorkspace } = useIsCurrentLocationOnAWorkspace();

  const workspacePublicData = useRecoilValue(workspacePublicDataState);

  const { setLastAuthenticateWorkspaceDomain } =
    useLastAuthenticatedWorkspaceDomain();
  const [checkUserExistsQuery, { data: checkUserExistsData }] =
    useCheckUserExistsLazyQuery();

  const client = useApolloClient();

  const goToRecoilSnapshot = useGotoRecoilSnapshot();

  const setDateTimeFormat = useSetRecoilState(dateTimeFormatState);

  const [, setSearchParams] = useSearchParams();

  const navigate = useNavigate();

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
        const captcha = snapshot.getLoadable(captchaState).getValue();
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
        const apiConfig = snapshot.getLoadable(apiConfigState).getValue();
        const sentryConfig = snapshot.getLoadable(sentryConfigState).getValue();
        const workspacePublicData = snapshot
          .getLoadable(workspacePublicDataState)
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
          set(captchaState, captcha);
          set(apiConfigState, apiConfig);
          set(sentryConfigState, sentryConfig);
          set(workspacePublicDataState, workspacePublicData);
          set(clientConfigApiStatusState, clientConfigApiStatus);
          set(isCurrentUserLoadedState, isCurrentUserLoaded);
          set(isMultiWorkspaceEnabledState, isMultiWorkspaceEnabled);
          set(domainConfigurationState, domainConfiguration);
          return undefined;
        });

        goToRecoilSnapshot(initialSnapshot);

        sessionStorage.clear();
        localStorage.clear();
        await client.clearStore();
        // We need to explicitly clear the state to trigger the cookie deletion which include the parent domain
        setLastAuthenticateWorkspaceDomain(null);
        navigate(AppPath.SignInUp);
      },
    [navigate, client, goToRecoilSnapshot, setLastAuthenticateWorkspaceDomain],
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
        locale: workspaceMember.locale ?? SOURCE_LOCALE,
      }));

      setCurrentWorkspaceMembers(workspaceMembers);
    }

    if (isDefined(user.availableWorkspaces)) {
      setAvailableWorkspaces(user.availableWorkspaces);
    }

    if (isDefined(user.currentUserWorkspace)) {
      setCurrentUserWorkspace(user.currentUserWorkspace);
    }

    if (isDefined(user.workspaceMember)) {
      workspaceMember = {
        ...user.workspaceMember,
        colorScheme: user.workspaceMember?.colorScheme as ColorScheme,
        locale: user.workspaceMember?.locale ?? SOURCE_LOCALE,
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
      dynamicActivate(
        (workspaceMember.locale as keyof typeof APP_LOCALES) ?? SOURCE_LOCALE,
      );
    }

    const workspace = user.currentWorkspace ?? null;

    setCurrentWorkspace(workspace);

    if (isDefined(workspace) && isOnAWorkspace) {
      setLastAuthenticateWorkspaceDomain({
        workspaceId: workspace.id,
        workspaceUrl: getWorkspaceUrl(workspace.workspaceUrls),
      });
    }

    return {
      user,
      workspaceMember,
      workspace,
    };
  }, [
    getCurrentUser,
    isOnAWorkspace,
    setCurrentUser,
    setCurrentUserWorkspace,
    setCurrentWorkspace,
    setCurrentWorkspaceMember,
    setCurrentWorkspaceMembers,
    setDateTimeFormat,
    setLastAuthenticateWorkspaceDomain,
    setAvailableWorkspaces,
  ]);

  const handleSetAuthTokens = useCallback(
    (tokens: AuthTokenPair) => {
      setTokenPair(tokens);
      cookieStorage.setItem('tokenPair', JSON.stringify(tokens));
    },
    [setTokenPair],
  );

  const handleGetLoginTokenFromCredentials = useCallback(
    async (email: string, password: string, captchaToken?: string) => {
      try {
        const getLoginTokenResult = await getLoginTokenFromCredentials({
          variables: {
            email,
            password,
            captchaToken,
            origin,
          },
        });
        if (isDefined(getLoginTokenResult.errors)) {
          throw getLoginTokenResult.errors;
        }

        if (!getLoginTokenResult.data?.getLoginTokenFromCredentials) {
          throw new Error('No login token');
        }

        return getLoginTokenResult.data.getLoginTokenFromCredentials;
      } catch (error) {
        // TODO: Get intellisense for graphql error extensions code (codegen?)
        if (
          error instanceof ApolloError &&
          error.graphQLErrors[0]?.extensions?.subCode === 'EMAIL_NOT_VERIFIED'
        ) {
          setSearchParams({ email });
          setSignInUpStep(SignInUpStep.EmailVerification);
          throw error;
        }
        throw error;
      }
    },
    [getLoginTokenFromCredentials, setSearchParams, setSignInUpStep, origin],
  );

  const handleGetLoginTokenFromEmailVerificationToken = useCallback(
    async (
      emailVerificationToken: string,
      email: string,
      captchaToken?: string,
    ) => {
      const loginTokenResult = await getLoginTokenFromEmailVerificationToken({
        variables: {
          email,
          emailVerificationToken,
          captchaToken,
          origin,
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
    [getLoginTokenFromEmailVerificationToken, origin],
  );

  const handleGetWorkspaceAgnosticTokenFromEmailVerificationToken = useCallback(
    async (
      emailVerificationToken: string,
      email: string,
      captchaToken?: string,
    ) => {
      const { data, errors } =
        await getWorkspaceAgnosticTokenFromEmailVerificationToken({
          variables: {
            email,
            emailVerificationToken,
            captchaToken,
          },
        });

      if (isDefined(errors)) {
        throw errors;
      }

      if (!data?.getWorkspaceAgnosticTokenFromEmailVerificationToken) {
        throw new Error('No workspace agnostic token in result');
      }

      handleSetAuthTokens(
        data.getWorkspaceAgnosticTokenFromEmailVerificationToken.tokens,
      );

      const { user } = await loadCurrentUser();

      if (countAvailableWorkspaces(user.availableWorkspaces) === 0) {
        return await createWorkspace({ newTab: false });
      }

      setSignInUpStep(SignInUpStep.WorkspaceSelection);
    },
    [
      createWorkspace,
      getWorkspaceAgnosticTokenFromEmailVerificationToken,
      handleSetAuthTokens,
      loadCurrentUser,
      setSignInUpStep,
    ],
  );

  const handleSetLoginToken = useCallback(
    (token: AuthToken['token']) => {
      setLoginToken(token);
    },
    [setLoginToken],
  );

  const handleLoadWorkspaceAfterAuthentication = useCallback(
    async (authTokens: AuthTokenPair) => {
      handleSetAuthTokens(authTokens);

      // TODO: We can't parallelize this yet because when loadCurrentUSer is loaded
      // then UserProvider updates its children and PrefetchDataProvider is triggered
      // which requires the correct metadata to be loaded (not the mocks)
      await refreshObjectMetadataItems();
      await loadCurrentUser();
    },
    [loadCurrentUser, handleSetAuthTokens, refreshObjectMetadataItems],
  );

  const handleGetAuthTokensFromLoginToken = useCallback(
    async (loginToken: string) => {
      try {
        const getAuthTokensResult = await getAuthTokensFromLoginToken({
          variables: {
            loginToken: loginToken,
            origin,
          },
        });

        if (isDefined(getAuthTokensResult.errors)) {
          throw getAuthTokensResult.errors;
        }

        if (!getAuthTokensResult.data?.getAuthTokensFromLoginToken) {
          throw new Error('No getAuthTokensFromLoginToken result');
        }

        await handleLoadWorkspaceAfterAuthentication(
          getAuthTokensResult.data.getAuthTokensFromLoginToken.tokens,
        );
      } catch (error) {
        if (
          error instanceof ApolloError &&
          error.graphQLErrors[0]?.extensions?.subCode ===
            'TWO_FACTOR_AUTHENTICATION_PROVISION_REQUIRED'
        ) {
          handleSetLoginToken(loginToken);
          navigate(AppPath.SignInUp);
          setSignInUpStep(SignInUpStep.TwoFactorAuthenticationProvision);
        }

        if (
          error instanceof ApolloError &&
          error.graphQLErrors[0]?.extensions?.subCode ===
            'TWO_FACTOR_AUTHENTICATION_VERIFICATION_REQUIRED'
        ) {
          handleSetLoginToken(loginToken);
          navigate(AppPath.SignInUp);
          setSignInUpStep(SignInUpStep.TwoFactorAuthenticationVerification);
        }
      }
    },
    [
      handleSetLoginToken,
      getAuthTokensFromLoginToken,
      origin,
      handleLoadWorkspaceAfterAuthentication,
      setSignInUpStep,
      navigate,
    ],
  );

  const handleCredentialsSignIn = useCallback(
    async (email: string, password: string, captchaToken?: string) => {
      signIn({
        variables: { email, password, captchaToken },
        onCompleted: async (data) => {
          handleSetAuthTokens(data.signIn.tokens);
          const { user } = await loadCurrentUser();

          const availableWorkspacesCount = countAvailableWorkspaces(
            user.availableWorkspaces,
          );

          if (availableWorkspacesCount === 0) {
            return createWorkspace();
          }

          if (availableWorkspacesCount === 1) {
            const targetWorkspace = getFirstAvailableWorkspaces(
              user.availableWorkspaces,
            );
            return await redirectToWorkspaceDomain(
              getWorkspaceUrl(targetWorkspace.workspaceUrls),
              targetWorkspace.loginToken ? AppPath.Verify : AppPath.SignInUp,
              {
                ...(targetWorkspace.loginToken && {
                  loginToken: targetWorkspace.loginToken,
                }),
                email: user.email,
              },
            );
          }

          setSignInUpStep(SignInUpStep.WorkspaceSelection);
        },
        onError: (error) => {
          if (
            error instanceof ApolloError &&
            error.graphQLErrors[0]?.extensions?.subCode === 'EMAIL_NOT_VERIFIED'
          ) {
            setSearchParams({ email });
            setSignInUpStep(SignInUpStep.EmailVerification);
            throw error;
          }
          throw error;
        },
      });
    },
    [
      handleSetAuthTokens,
      redirectToWorkspaceDomain,
      signIn,
      loadCurrentUser,
      setSearchParams,
      setSignInUpStep,
      createWorkspace,
    ],
  );

  const handleCredentialsSignUp = useCallback(
    async (email: string, password: string, captchaToken?: string) => {
      const signUpResult = await signUp({
        variables: {
          email,
          password,
          captchaToken,
          locale: i18n.locale ?? SOURCE_LOCALE,
        },
      });

      if (isDefined(signUpResult.errors)) {
        throw signUpResult.errors;
      }

      if (isEmailVerificationRequired) {
        setSearchParams({ email });
        setSignInUpStep(SignInUpStep.EmailVerification);
        return null;
      }

      if (!signUpResult.data?.signUp) {
        throw new Error('No signUp result');
      }

      handleSetAuthTokens(signUpResult.data.signUp.tokens);

      const { user } = await loadCurrentUser();

      if (countAvailableWorkspaces(user.availableWorkspaces) === 0) {
        return await createWorkspace({ newTab: false });
      }

      setSignInUpStep(SignInUpStep.WorkspaceSelection);
    },
    [
      isEmailVerificationRequired,
      setSearchParams,
      handleSetAuthTokens,
      signUp,
      loadCurrentUser,
      setSignInUpStep,
      createWorkspace,
    ],
  );

  const handleCredentialsSignInInWorkspace = useCallback(
    async (email: string, password: string, captchaToken?: string) => {
      const { loginToken } = await handleGetLoginTokenFromCredentials(
        email,
        password,
        captchaToken,
      );
      await handleGetAuthTokensFromLoginToken(loginToken.token);
    },
    [handleGetLoginTokenFromCredentials, handleGetAuthTokensFromLoginToken],
  );

  const handleSignOut = useCallback(async () => {
    await clearSession();
    await requestFreshCaptchaToken();
  }, [clearSession, requestFreshCaptchaToken]);

  const handleCredentialsSignUpInWorkspace = useCallback(
    async ({
      email,
      password,
      workspaceInviteHash,
      workspacePersonalInviteToken,
      captchaToken,
      verifyEmailRedirectPath,
    }: {
      email: string;
      password: string;
      workspaceInviteHash?: string;
      workspacePersonalInviteToken?: string;
      captchaToken?: string;
      verifyEmailRedirectPath?: string;
    }) => {
      const signUpInWorkspaceResult = await signUpInWorkspace({
        variables: {
          email,
          password,
          workspaceInviteHash,
          workspacePersonalInviteToken,
          captchaToken,
          locale: i18n.locale ?? SOURCE_LOCALE,
          ...(workspacePublicData?.id
            ? { workspaceId: workspacePublicData.id }
            : {}),
          verifyEmailRedirectPath,
        },
      });

      if (isDefined(signUpInWorkspaceResult.errors)) {
        throw signUpInWorkspaceResult.errors;
      }

      if (!signUpInWorkspaceResult.data?.signUpInWorkspace) {
        throw new Error('No login token');
      }

      if (isEmailVerificationRequired) {
        setSearchParams({ email });
        setSignInUpStep(SignInUpStep.EmailVerification);
        return null;
      }

      if (isMultiWorkspaceEnabled) {
        return await redirectToWorkspaceDomain(
          getWorkspaceUrl(
            signUpInWorkspaceResult.data.signUpInWorkspace.workspace
              .workspaceUrls,
          ),
          isEmailVerificationRequired ? AppPath.SignInUp : AppPath.Verify,
          {
            ...(!isEmailVerificationRequired && {
              loginToken:
                signUpInWorkspaceResult.data.signUpInWorkspace.loginToken.token,
            }),
            email,
          },
        );
      }

      await handleGetAuthTokensFromLoginToken(
        signUpInWorkspaceResult.data?.signUpInWorkspace.loginToken.token,
      );
    },
    [
      signUpInWorkspace,
      workspacePublicData,
      isMultiWorkspaceEnabled,
      handleGetAuthTokensFromLoginToken,
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
        action?: string;
      },
    ) => {
      const url = new URL(`${REACT_APP_SERVER_BASE_URL}${path}`);
      if (isDefined(params.workspaceInviteHash)) {
        url.searchParams.set('workspaceInviteHash', params.workspaceInviteHash);
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

      if (isDefined(params.action)) {
        url.searchParams.set('action', params.action);
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
      action: string;
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
      action: string;
    }) => {
      redirect(buildRedirectUrl('/auth/microsoft', params));
    },
    [buildRedirectUrl, redirect],
  );

  const handleGetAuthTokensFromOTP = useCallback(
    async (otp: string, loginToken: string, captchaToken?: string) => {
      const getAuthTokensFromOtpResult = await getAuthTokensFromOtp({
        variables: {
          captchaToken,
          origin,
          otp,
          loginToken,
        },
      });

      if (isDefined(getAuthTokensFromOtpResult.errors)) {
        throw getAuthTokensFromOtpResult.errors;
      }

      if (!getAuthTokensFromOtpResult.data?.getAuthTokensFromOTP) {
        throw new Error('No getAuthTokensFromOTP result');
      }

      await handleLoadWorkspaceAfterAuthentication(
        getAuthTokensFromOtpResult.data.getAuthTokensFromOTP.tokens,
      );
    },
    [getAuthTokensFromOtp, origin, handleLoadWorkspaceAfterAuthentication],
  );

  return {
    getLoginTokenFromCredentials: handleGetLoginTokenFromCredentials,
    getWorkspaceAgnosticTokenFromEmailVerificationToken:
      handleGetWorkspaceAgnosticTokenFromEmailVerificationToken,
    getLoginTokenFromEmailVerificationToken:
      handleGetLoginTokenFromEmailVerificationToken,
    getAuthTokensFromLoginToken: handleGetAuthTokensFromLoginToken,

    loadCurrentUser,

    checkUserExists: { checkUserExistsData, checkUserExistsQuery },
    clearSession,
    signOut: handleSignOut,
    signUpWithCredentials: handleCredentialsSignUp,
    signUpWithCredentialsInWorkspace: handleCredentialsSignUpInWorkspace,
    signInWithCredentialsInWorkspace: handleCredentialsSignInInWorkspace,
    signInWithCredentials: handleCredentialsSignIn,
    signInWithGoogle: handleGoogleLogin,
    signInWithMicrosoft: handleMicrosoftLogin,
    setAuthTokens: handleSetAuthTokens,
    getAuthTokensFromOTP: handleGetAuthTokensFromOTP,
  };
};
