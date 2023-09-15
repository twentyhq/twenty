import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import { useRecoilState } from 'recoil';

import {
  useChallengeMutation,
  useCheckUserExistsLazyQuery,
  useSignUpMutation,
  useVerifyMutation,
} from '~/generated/graphql';

import { currentUserState } from '../states/currentUserState';
import { tokenPairState } from '../states/tokenPairState';

export function useAuth() {
  const [, setTokenPair] = useRecoilState(tokenPairState);
  const [, setCurrentUser] = useRecoilState(currentUserState);

  const [challenge] = useChallengeMutation();
  const [signUp] = useSignUpMutation();
  const [verify] = useVerifyMutation();
  const [checkUserExistsQuery, { data: checkUserExistsData }] =
    useCheckUserExistsLazyQuery();

  const client = useApolloClient();

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

      if (!verifyResult.data?.verify.user.workspaceMember) {
        throw new Error('No workspace member');
      }

      if (!verifyResult.data?.verify.user.workspaceMember.settings) {
        throw new Error('No settings');
      }

      setCurrentUser({
        ...verifyResult.data?.verify.user,
        workspaceMember: {
          ...verifyResult.data?.verify.user.workspaceMember,
          settings: verifyResult.data?.verify.user.workspaceMember.settings,
        },
      });
      setTokenPair(verifyResult.data?.verify.tokens);

      return verifyResult.data?.verify;
    },
    [setTokenPair, verify, setCurrentUser],
  );

  const handleCrendentialsSignIn = useCallback(
    async (email: string, password: string) => {
      const { loginToken } = await handleChallenge(email, password);

      const { user } = await handleVerify(loginToken.token);
      return user;
    },
    [handleChallenge, handleVerify],
  );

  const handleSignOut = useCallback(() => {
    setTokenPair(null);
    setCurrentUser(null);
    client.clearStore().then(() => {
      sessionStorage.clear();
    });
  }, [setTokenPair, client, setCurrentUser]);

  const handleCredentialsSignUp = useCallback(
    async (email: string, password: string, workspaceInviteHash?: string) => {
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

      const { user } = await handleVerify(
        signUpResult.data?.signUp.loginToken.token,
      );

      return user;
    },
    [signUp, handleVerify],
  );

  const handleGoogleLogin = useCallback((workspaceInviteHash?: string) => {
    const authServerUrl =
      process.env.REACT_APP_SERVER_AUTH_URL ??
      process.env.REACT_APP_SERVER_BASE_URL + '/auth';
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
}
