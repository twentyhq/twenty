import { useApolloClient } from '@apollo/client';
import { useCallback } from 'react';
import {
  snapshot_UNSTABLE,
  useGotoRecoilSnapshot,
  useRecoilCallback,
  useRecoilState,
  useSetRecoilState,
} from 'recoil';
import { iconsState } from 'twenty-ui';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadingState';
import { isVerifyPendingState } from '@/auth/states/isVerifyPendingState';
import { workspacesState } from '@/auth/states/workspaces';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { billingState } from '@/client-config/states/billingState';
import { captchaProviderState } from '@/client-config/states/captchaProviderState';
import { isClientConfigLoadedState } from '@/client-config/states/isClientConfigLoadedState';
import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { isSignInPrefilledState } from '@/client-config/states/isSignInPrefilledState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  useChallengeMutation,
  useCheckUserExistsLazyQuery,
  useSignUpMutation,
  useVerifyMutation,
} from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersStates';
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

export const useAuth = () => {
  const [, setTokenPair] = useRecoilState(tokenPairState);
  const setCurrentUser = useSetRecoilState(currentUserState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );
  const setCurrentWorkspaceMembers = useSetRecoilState(
    currentWorkspaceMembersState,
  );

  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
  const setIsVerifyPendingState = useSetRecoilState(isVerifyPendingState);
  const setWorkspaces = useSetRecoilState(workspacesState);

  const [challenge] = useChallengeMutation();
  const [signUp] = useSignUpMutation();
  const [verify] = useVerifyMutation();
  const [checkUserExistsQuery, { data: checkUserExistsData }] =
    useCheckUserExistsLazyQuery();

  const client = useApolloClient();

  const goToRecoilSnapshot = useGotoRecoilSnapshot();

  const setDateTimeFormat = useSetRecoilState(dateTimeFormatState);

  const handleChallenge = useCallback(
    async (email: string, password: string, captchaToken?: string) => {
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
    },
    [challenge],
  );

  const handleVerify = useCallback(
    async (loginToken: string) => {
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

      const user = verifyResult.data?.verify.user;

      let workspaceMember = null;

      setCurrentUser(user);

      if (isDefined(user.workspaceMembers)) {
        const workspaceMembers = user.workspaceMembers.map(
          (workspaceMember) => ({
            ...workspaceMember,
            colorScheme: workspaceMember.colorScheme as ColorScheme,
            locale: workspaceMember.locale ?? 'en',
          }),
        );

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
      }

      const workspace = user.defaultWorkspace ?? null;

      setCurrentWorkspace(workspace);

      if (isDefined(verifyResult.data?.verify.user.workspaces)) {
        const validWorkspaces = verifyResult.data?.verify.user.workspaces
          .filter(
            ({ workspace }) => workspace !== null && workspace !== undefined,
          )
          .map((validWorkspace) => validWorkspace.workspace)
          .filter(isDefined);

        setWorkspaces(validWorkspaces);
      }

      return {
        user,
        workspaceMember,
        workspace,
        tokens: verifyResult.data?.verify.tokens,
      };
    },
    [
      verify,
      setTokenPair,
      setCurrentUser,
      setCurrentWorkspace,
      setCurrentWorkspaceMembers,
      setCurrentWorkspaceMember,
      setDateTimeFormat,
      setWorkspaces,
    ],
  );

  const handleCrendentialsSignIn = useCallback(
    async (email: string, password: string, captchaToken?: string) => {
      const { loginToken } = await handleChallenge(
        email,
        password,
        captchaToken,
      );
      setIsVerifyPendingState(true);

      const { user, workspaceMember, workspace } = await handleVerify(
        loginToken.token,
      );

      setIsVerifyPendingState(false);

      return {
        user,
        workspaceMember,
        workspace,
      };
    },
    [handleChallenge, handleVerify, setIsVerifyPendingState],
  );

  const handleSignOut = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const emptySnapshot = snapshot_UNSTABLE();
        const iconsValue = snapshot.getLoadable(iconsState).getValue();
        const authProvidersValue = snapshot
          .getLoadable(authProvidersState)
          .getValue();
        const billing = snapshot.getLoadable(billingState).getValue();
        const isSignInPrefilled = snapshot
          .getLoadable(isSignInPrefilledState)
          .getValue();
        const supportChat = snapshot.getLoadable(supportChatState).getValue();
        const isDebugMode = snapshot.getLoadable(isDebugModeState).getValue();
        const captchaProvider = snapshot
          .getLoadable(captchaProviderState)
          .getValue();
        const isClientConfigLoaded = snapshot
          .getLoadable(isClientConfigLoadedState)
          .getValue();
        const isCurrentUserLoaded = snapshot
          .getLoadable(isCurrentUserLoadedState)
          .getValue();

        const initialSnapshot = emptySnapshot.map(({ set }) => {
          set(iconsState, iconsValue);
          set(authProvidersState, authProvidersValue);
          set(billingState, billing);
          set(isSignInPrefilledState, isSignInPrefilled);
          set(supportChatState, supportChat);
          set(isDebugModeState, isDebugMode);
          set(captchaProviderState, captchaProvider);
          set(isClientConfigLoadedState, isClientConfigLoaded);
          set(isCurrentUserLoadedState, isCurrentUserLoaded);
          return undefined;
        });

        goToRecoilSnapshot(initialSnapshot);

        await client.clearStore();
        sessionStorage.clear();
        localStorage.clear();
      },
    [client, goToRecoilSnapshot],
  );

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
        },
      });

      if (isDefined(signUpResult.errors)) {
        throw signUpResult.errors;
      }

      if (!signUpResult.data?.signUp) {
        throw new Error('No login token');
      }

      const { user, workspace, workspaceMember } = await handleVerify(
        signUpResult.data?.signUp.loginToken.token,
      );

      setIsVerifyPendingState(false);

      return { user, workspaceMember, workspace };
    },
    [setIsVerifyPendingState, signUp, handleVerify],
  );

  const buildRedirectUrl = (
    path: string,
    params: {
      workspacePersonalInviteToken?: string;
      workspaceInviteHash?: string;
    },
  ) => {
    const authServerUrl = REACT_APP_SERVER_BASE_URL;
    const url = new URL(`${authServerUrl}${path}`);
    if (isDefined(params.workspaceInviteHash)) {
      url.searchParams.set('inviteHash', params.workspaceInviteHash);
    }
    if (isDefined(params.workspacePersonalInviteToken)) {
      url.searchParams.set('inviteToken', params.workspacePersonalInviteToken);
    }
    return url.toString();
  };

  const handleGoogleLogin = useCallback(
    (params: {
      workspacePersonalInviteToken?: string;
      workspaceInviteHash?: string;
    }) => {
      window.location.href = buildRedirectUrl('/auth/google', params);
    },
    [],
  );

  const handleMicrosoftLogin = useCallback(
    (params: {
      workspacePersonalInviteToken?: string;
      workspaceInviteHash?: string;
    }) => {
      window.location.href = buildRedirectUrl('/auth/microsoft', params);
    },
    [],
  );

  return {
    challenge: handleChallenge,
    verify: handleVerify,

    checkUserExists: { checkUserExistsData, checkUserExistsQuery },

    signOut: handleSignOut,
    signUpWithCredentials: handleCredentialsSignUp,
    signInWithCredentials: handleCrendentialsSignIn,
    signInWithGoogle: handleGoogleLogin,
    signInWithMicrosoft: handleMicrosoftLogin,
  };
};
