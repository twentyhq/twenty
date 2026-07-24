import {
  useApolloClient,
  useLazyQuery,
  useMutation,
} from '@apollo/client/react';
import { useCallback } from 'react';
import { AppPath } from 'twenty-shared/types';

import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  type AuthToken,
  type AuthTokenPair,
  CheckUserExistsDocument,
  GetAuthTokensFromLoginTokenDocument,
  GetAuthTokensFromOtpDocument,
  GetLoginTokenFromCredentialsDocument,
  GetWorkspaceCreationDefaultsDocument,
  SignInDocument,
  SignUpInWorkspaceDocument,
  SignUpDocument,
  VerifyEmailAndGetLoginTokenDocument,
  VerifyEmailAndGetWorkspaceAgnosticTokenDocument,
} from '~/generated-metadata/graphql';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { returnToPathState } from '@/auth/states/returnToPathState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { clearSessionLocalStorageKeys } from '@/auth/utils/clearSessionLocalStorageKeys';
import { broadcastSignOutToOtherTabs } from '@/auth/utils/crossTabSignOut';
import { isValidReturnToPath } from '@/auth/utils/isValidReturnToPath';
import { isNonEmptyString } from '@sniptt/guards';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { loginTokenState } from '@/auth/states/loginTokenState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { type BillingCheckoutSession } from '@/auth/types/billingCheckoutSession.type';
import {
  countAvailableWorkspaces,
  getFirstAvailableWorkspaces,
} from '@/auth/utils/availableWorkspacesUtils';
import { isEmailVerificationRequiredState } from '@/client-config/states/isEmailVerificationRequiredState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useLastAuthenticatedWorkspaceDomain } from '@/domain-manager/hooks/useLastAuthenticatedWorkspaceDomain';
import { useOrigin } from '@/domain-manager/hooks/useOrigin';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { i18n } from '@lingui/core';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';
import { useStore } from 'jotai';

export const useAuth = () => {
  const store = useStore();
  const setTokenPair = useSetAtomState(tokenPairState);
  const setLoginToken = useSetAtomState(loginTokenState);
  const setIsAppEffectRedirectEnabled = useSetAtomState(
    isAppEffectRedirectEnabledState,
  );

  const { origin } = useOrigin();
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );
  const isEmailVerificationRequired = useAtomStateValue(
    isEmailVerificationRequiredState,
  );
  const { loadCurrentUser } = useLoadCurrentUser();
  const apolloClient = useApolloClient();

  const setSignInUpStep = useSetAtomState(signInUpStepState);
  const { redirect } = useRedirect();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();

  const [getLoginTokenFromCredentials] = useMutation(
    GetLoginTokenFromCredentialsDocument,
  );
  const [signIn] = useMutation(SignInDocument);
  const [signUp] = useMutation(SignUpDocument);
  const [signUpInWorkspace] = useMutation(SignUpInWorkspaceDocument);
  const [getAuthTokensFromLoginToken] = useMutation(
    GetAuthTokensFromLoginTokenDocument,
  );
  const [verifyEmailAndGetLoginToken] = useMutation(
    VerifyEmailAndGetLoginTokenDocument,
  );
  const [verifyEmailAndGetWorkspaceAgnosticToken] = useMutation(
    VerifyEmailAndGetWorkspaceAgnosticTokenDocument,
  );
  const [getAuthTokensFromOtp] = useMutation(GetAuthTokensFromOtpDocument);

  const workspacePublicData = useAtomStateValue(workspacePublicDataState);

  const { setLastAuthenticateWorkspaceDomain } =
    useLastAuthenticatedWorkspaceDomain();
  const [checkUserExistsQuery, { data: checkUserExistsData }] = useLazyQuery(
    CheckUserExistsDocument,
  );

  const [, setSearchParams] = useSearchParams();

  const navigate = useNavigate();

  const clearSession = useCallback(() => {
    sessionStorage.clear();
    store.set(tokenPairState.atom, null);
    store.set(currentUserState.atom, null);
    store.set(currentWorkspaceState.atom, null);
    store.set(currentWorkspaceMemberState.atom, null);
    store.set(currentUserWorkspaceState.atom, null);
    clearSessionLocalStorageKeys();
    setLastAuthenticateWorkspaceDomain(null);
    window.location.assign(AppPath.SignInUp);
  }, [store, setLastAuthenticateWorkspaceDomain]);

  const handleSetAuthTokens = useCallback(
    (tokens: AuthTokenPair) => {
      setTokenPair(tokens);
    },
    [setTokenPair],
  );

  const navigateAfterMultiWorkspaceSignInUp = useCallback(
    async (
      availableWorkspaces: Parameters<typeof countAvailableWorkspaces>[0],
      email: string,
    ) => {
      const availableWorkspacesCount =
        countAvailableWorkspaces(availableWorkspaces);

      // The in-app "Create Workspace" entry point redirects here with this
      // signal so an existing user with workspaces lands on the creation form
      // instead of the workspace selection step.
      const wantsToCreateNewWorkspace =
        new URLSearchParams(window.location.search).get('action') ===
        'create-new-workspace';

      if (availableWorkspacesCount === 0 || wantsToCreateNewWorkspace) {
        await apolloClient.query({
          query: GetWorkspaceCreationDefaultsDocument,
        });
        setSignInUpStep(SignInUpStep.WorkspaceCreation);
        return;
      }

      if (availableWorkspacesCount === 1) {
        const targetWorkspace =
          getFirstAvailableWorkspaces(availableWorkspaces);

        return await redirectToWorkspaceDomain(
          getWorkspaceUrl(targetWorkspace.workspaceUrls),
          targetWorkspace.loginToken ? AppPath.Verify : AppPath.SignInUp,
          {
            ...(targetWorkspace.loginToken && {
              loginToken: targetWorkspace.loginToken,
            }),
            email,
          },
        );
      }

      setSignInUpStep(SignInUpStep.WorkspaceSelection);
    },
    [apolloClient, redirectToWorkspaceDomain, setSignInUpStep],
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
        if (isDefined(getLoginTokenResult.error)) {
          throw getLoginTokenResult.error;
        }

        if (!getLoginTokenResult.data?.getLoginTokenFromCredentials) {
          throw new Error('No login token');
        }

        return getLoginTokenResult.data.getLoginTokenFromCredentials;
      } catch (error) {
        if (isGraphqlErrorOfType(error, 'EMAIL_NOT_VERIFIED')) {
          setSearchParams({ email });
          setSignInUpStep(SignInUpStep.EmailVerification);
          throw error;
        }
        throw error;
      }
    },
    [getLoginTokenFromCredentials, setSearchParams, setSignInUpStep, origin],
  );

  const handleverifyEmailAndGetLoginToken = useCallback(
    async (
      emailVerificationToken: string,
      email: string,
      captchaToken?: string,
    ) => {
      const loginTokenResult = await verifyEmailAndGetLoginToken({
        variables: {
          email,
          emailVerificationToken,
          captchaToken,
          origin,
        },
      });

      if (isDefined(loginTokenResult.error)) {
        throw loginTokenResult.error;
      }

      if (!loginTokenResult.data?.verifyEmailAndGetLoginToken) {
        throw new Error('No login token');
      }

      return loginTokenResult.data.verifyEmailAndGetLoginToken;
    },
    [verifyEmailAndGetLoginToken, origin],
  );

  const handleverifyEmailAndGetWorkspaceAgnosticToken = useCallback(
    async (
      emailVerificationToken: string,
      email: string,
      captchaToken?: string,
    ) => {
      const { data, error } = await verifyEmailAndGetWorkspaceAgnosticToken({
        variables: {
          email,
          emailVerificationToken,
          captchaToken,
        },
      });

      if (isDefined(error)) {
        throw error;
      }

      if (!data?.verifyEmailAndGetWorkspaceAgnosticToken) {
        throw new Error('No workspace agnostic token in result');
      }

      handleSetAuthTokens(data.verifyEmailAndGetWorkspaceAgnosticToken.tokens);

      const { user } = await loadCurrentUser();

      await navigateAfterMultiWorkspaceSignInUp(
        user.availableWorkspaces,
        user.email,
      );
    },
    [
      verifyEmailAndGetWorkspaceAgnosticToken,
      handleSetAuthTokens,
      loadCurrentUser,
      navigateAfterMultiWorkspaceSignInUp,
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
      setIsAppEffectRedirectEnabled(false);

      try {
        await loadCurrentUser();
      } finally {
        setIsAppEffectRedirectEnabled(true);
      }
    },
    [loadCurrentUser, handleSetAuthTokens, setIsAppEffectRedirectEnabled],
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

        if (isDefined(getAuthTokensResult.error)) {
          throw getAuthTokensResult.error;
        }

        if (!getAuthTokensResult.data?.getAuthTokensFromLoginToken) {
          throw new Error('No getAuthTokensFromLoginToken result');
        }

        await handleLoadWorkspaceAfterAuthentication(
          getAuthTokensResult.data.getAuthTokensFromLoginToken.tokens,
        );
      } catch (error) {
        if (
          isGraphqlErrorOfType(
            error,
            'TWO_FACTOR_AUTHENTICATION_PROVISION_REQUIRED',
          )
        ) {
          handleSetLoginToken(loginToken);
          navigate(AppPath.SignInUp);
          setSignInUpStep(SignInUpStep.TwoFactorAuthenticationProvision);
          return;
        }

        if (
          isGraphqlErrorOfType(
            error,
            'TWO_FACTOR_AUTHENTICATION_VERIFICATION_REQUIRED',
          )
        ) {
          handleSetLoginToken(loginToken);
          navigate(AppPath.SignInUp);
          setSignInUpStep(SignInUpStep.TwoFactorAuthenticationVerification);
          return;
        }
        throw error;
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
      await signIn({
        variables: { email, password, captchaToken },
        onCompleted: async (data) => {
          handleSetAuthTokens(data.signIn.tokens);
          const { user } = await loadCurrentUser();

          await navigateAfterMultiWorkspaceSignInUp(
            user.availableWorkspaces,
            user.email,
          );
        },
        onError: (error) => {
          if (isGraphqlErrorOfType(error, 'EMAIL_NOT_VERIFIED')) {
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
      signIn,
      loadCurrentUser,
      setSearchParams,
      setSignInUpStep,
      navigateAfterMultiWorkspaceSignInUp,
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

      if (isDefined(signUpResult.error)) {
        throw signUpResult.error;
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

      await navigateAfterMultiWorkspaceSignInUp(
        user.availableWorkspaces,
        user.email,
      );
    },
    [
      isEmailVerificationRequired,
      setSearchParams,
      handleSetAuthTokens,
      signUp,
      loadCurrentUser,
      setSignInUpStep,
      navigateAfterMultiWorkspaceSignInUp,
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

  const handleSignOut = useCallback(() => {
    broadcastSignOutToOtherTabs();
    clearSession();
  }, [clearSession]);

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

      if (isDefined(signUpInWorkspaceResult.error)) {
        throw signUpInWorkspaceResult.error;
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

      const returnToPath = store.get(returnToPathState.atom);

      if (isNonEmptyString(returnToPath) && isValidReturnToPath(returnToPath)) {
        url.searchParams.set('returnToPath', returnToPath);
      }

      return url.toString();
    },
    [workspacePublicData, store],
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

      if (isDefined(getAuthTokensFromOtpResult.error)) {
        throw getAuthTokensFromOtpResult.error;
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
    verifyEmailAndGetWorkspaceAgnosticToken:
      handleverifyEmailAndGetWorkspaceAgnosticToken,
    verifyEmailAndGetLoginToken: handleverifyEmailAndGetLoginToken,
    getAuthTokensFromLoginToken: handleGetAuthTokensFromLoginToken,
    checkUserExists: { checkUserExistsData, checkUserExistsQuery },
    clearSession,
    signOut: handleSignOut,
    signUpWithCredentials: handleCredentialsSignUp,
    signUpWithCredentialsInWorkspace: handleCredentialsSignUpInWorkspace,
    signInWithCredentialsInWorkspace: handleCredentialsSignInInWorkspace,
    signInWithCredentials: handleCredentialsSignIn,
    signInWithGoogle: handleGoogleLogin,
    signInWithMicrosoft: handleMicrosoftLogin,
    getAuthTokensFromOTP: handleGetAuthTokensFromOTP,
    navigateAfterMultiWorkspaceSignInUp,
  };
};
