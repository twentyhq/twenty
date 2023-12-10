import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import {
  snapshot_UNSTABLE,
  useGotoRecoilSnapshot,
  useRecoilState,
  useSetRecoilState,
} from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isVerifyPendingState } from '@/auth/states/isVerifyPendingState';
import { ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { REACT_APP_SERVER_AUTH_URL } from '~/config';
import {
  useChallengeMutation,
  useCheckUserExistsLazyQuery,
  useSignUpMutation,
  useVerifyMutation,
} from '~/generated/graphql';

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

      if (challengeResult.errors) {
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

      if (verifyResult.errors) {
        throw verifyResult.errors;
      }

      if (!verifyResult.data?.verify) {
        throw new Error('No verify result');
      }

      setTokenPair(verifyResult.data?.verify.tokens);

      const user = verifyResult.data?.verify.user;
      const workspaceMember = {
        ...user.workspaceMember,
        colorScheme: user.workspaceMember?.colorScheme as ColorScheme,
      };
      const workspace = user.defaultWorkspace ?? null;
      setCurrentUser(user);
      setCurrentWorkspaceMember(workspaceMember);
      setCurrentWorkspace(workspace);
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

  const handleSignOut = useCallback(() => {
    goToRecoilSnapshot(snapshot_UNSTABLE());
    setTokenPair(null);
    setCurrentUser(null);
    client.clearStore().then(() => {
      sessionStorage.clear();
    });
  }, [goToRecoilSnapshot, setTokenPair, setCurrentUser, client]);

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

      if (signUpResult.errors) {
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
    const authServerUrl = REACT_APP_SERVER_AUTH_URL;
    window.location.href =
      `${authServerUrl}/google/${
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
  };
};
