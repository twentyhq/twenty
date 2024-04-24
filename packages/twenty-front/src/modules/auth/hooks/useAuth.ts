import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
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
import { isClientConfigLoadedState } from '@/client-config/states/isClientConfigLoadedState';
import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { isSignInPrefilledState } from '@/client-config/states/isSignInPrefilledState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { telemetryState } from '@/client-config/states/telemetryState';
import { ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  useChallengeMutation,
  useCheckUserExistsLazyQuery,
  useSignUpMutation,
  useVerifyMutation,
} from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

import { currentUserState } from '../states/currentUserState';
import { tokenPairState } from '../states/tokenPairState';

export const useAuth = () => {
  const [, setTokenPair] = useRecoilState(tokenPairState);
  const setCurrentUser = useSetRecoilState(currentUserState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
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

  const handleChallenge = useCallback(
    async (email: string, password: string) => {
      const challengeResult = await challenge({
        variables: {
          email,
          password,
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
      if (isDefined(user.workspaceMember)) {
        workspaceMember = {
          ...user.workspaceMember,
          colorScheme: user.workspaceMember?.colorScheme as ColorScheme,
        };
        setCurrentWorkspaceMember(workspaceMember);
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
      setCurrentWorkspaceMember,
      setCurrentWorkspace,
      setWorkspaces,
    ],
  );

  const handleCrendentialsSignIn = useCallback(
    async (email: string, password: string) => {
      const { loginToken } = await handleChallenge(email, password);
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
        const telemetry = snapshot.getLoadable(telemetryState).getValue();
        const isDebugMode = snapshot.getLoadable(isDebugModeState).getValue();
        const isClientConfigLoaded = snapshot
          .getLoadable(isClientConfigLoadedState)
          .getValue();
        const isCurrentUserLoaded = snapshot
          .getLoadable(isCurrentUserLoadedState)
          .getValue();

        const initialSnapshot = emptySnapshot.map(({ set }) => {
          set(isClientConfigLoadedState, isClientConfigLoaded);
          set(isCurrentUserLoadedState, isCurrentUserLoaded);
          set(iconsState, iconsValue);
          set(authProvidersState, authProvidersValue);
          set(billingState, billing);
          set(isSignInPrefilledState, isSignInPrefilled);
          set(supportChatState, supportChat);
          set(telemetryState, telemetry);
          set(isDebugModeState, isDebugMode);
          return undefined;
        });

        goToRecoilSnapshot(initialSnapshot);

        await client.clearStore();
        sessionStorage.clear();
      },
    [client, goToRecoilSnapshot],
  );

  const handleCredentialsSignUp = useCallback(
    async (email: string, password: string, workspaceInviteHash?: string) => {
      setIsVerifyPendingState(true);

      const signUpResult = await signUp({
        variables: {
          email,
          password,
          workspaceInviteHash,
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

  const handleGoogleLogin = useCallback((workspaceInviteHash?: string) => {
    const authServerUrl = REACT_APP_SERVER_BASE_URL;
    window.location.href =
      `${authServerUrl}/auth/google/${
        workspaceInviteHash ? '?inviteHash=' + workspaceInviteHash : ''
      }` || '';
  }, []);

  const handleMicrosoftLogin = useCallback((workspaceInviteHash?: string) => {
    const authServerUrl = REACT_APP_SERVER_BASE_URL;
    window.location.href =
      `${authServerUrl}/auth/microsoft/${
        workspaceInviteHash ? '?inviteHash=' + workspaceInviteHash : ''
      }` || '';
  }, []);

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
