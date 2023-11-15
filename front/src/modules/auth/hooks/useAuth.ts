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
import { CREATE_ONE_WORKSPACE_MEMBER_V2 } from '@/object-record/graphql/mutation/createOneWorkspaceMember';
import { FIND_ONE_WORKSPACE_MEMBER_V2 } from '@/object-record/graphql/queries/findOneWorkspaceMember';
import { REACT_APP_SERVER_AUTH_URL } from '~/config';
import {
  useChallengeMutation,
  useCheckUserExistsLazyQuery,
  useGetCurrentWorkspaceLazyQuery,
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
  const [getCurrentWorkspaceQuery] = useGetCurrentWorkspaceLazyQuery();

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
      const workspaceMember = await client.query({
        query: FIND_ONE_WORKSPACE_MEMBER_V2,
        variables: {
          filter: {
            userId: { eq: verifyResult.data?.verify.user.id },
          },
        },
      });
      const currentWorkspace = await getCurrentWorkspaceQuery();

      setCurrentUser(verifyResult.data?.verify.user);
      setCurrentWorkspaceMember(workspaceMember.data?.findMany);
      setCurrentWorkspace(currentWorkspace.data?.currentWorkspace ?? null);
      return {
        user: verifyResult.data?.verify.user,
        workspaceMember: workspaceMember.data?.findMany,
        workspace: currentWorkspace.data?.currentWorkspace,
        tokens: verifyResult.data?.verify.tokens,
      };
    },
    [
      verify,
      setTokenPair,
      client,
      getCurrentWorkspaceQuery,
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

      const { user, workspace } = await handleVerify(
        signUpResult.data?.signUp.loginToken.token,
      );

      const workspaceMember = await client.mutate({
        mutation: CREATE_ONE_WORKSPACE_MEMBER_V2,
        variables: {
          input: {
            firstName: user.firstName ?? '',
            lastName: user.lastName ?? '',
            colorScheme: 'Light',
            userId: user.id,
            allowImpersonation: true,
            locale: 'en',
          },
        },
      });
      setCurrentWorkspaceMember(workspaceMember.data?.createWorkspaceMemberV2);

      setIsVerifyPendingState(false);

      return { user, workspaceMember, workspace };
    },
    [
      setIsVerifyPendingState,
      signUp,
      handleVerify,
      client,
      setCurrentWorkspaceMember,
    ],
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
