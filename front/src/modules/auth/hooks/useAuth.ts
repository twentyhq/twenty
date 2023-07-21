import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import { useRecoilState } from 'recoil';

import {
  useChallengeMutation,
  useCheckUserExistsLazyQuery,
  useSignUpMutation,
  useVerifyMutation,
} from '~/generated/graphql';

import { isAuthenticatingState } from '../states/isAuthenticatingState';
import { tokenPairState } from '../states/tokenPairState';

export function useAuth() {
  const [, setTokenPair] = useRecoilState(tokenPairState);
  const [, setIsAuthenticating] = useRecoilState(isAuthenticatingState);

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

      setTokenPair(verifyResult.data?.verify.tokens);

      setIsAuthenticating(false);

      return verifyResult.data?.verify;
    },
    [setIsAuthenticating, setTokenPair, verify],
  );

  const handleCrendentialsSignIn = useCallback(
    async (email: string, password: string) => {
      const { loginToken } = await handleChallenge(email, password);

      await handleVerify(loginToken.token);
    },
    [handleChallenge, handleVerify],
  );

  const handleSignOut = useCallback(() => {
    setTokenPair(null);
    client.clearStore();
  }, [setTokenPair, client]);

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

      await handleVerify(signUpResult.data?.signUp.loginToken.token);
    },
    [signUp, handleVerify],
  );

  const googleLogin = useCallback(() => {
    window.location.href = process.env.REACT_APP_AUTH_URL + '/google' || '';
  }, []);

  return {
    challenge: handleChallenge,
    verify: handleVerify,

    checkUserExists: { checkUserExistsData, checkUserExistsQuery },

    signOut: handleSignOut,
    credentialsSignUp: handleCredentialsSignUp,
    credentialsSignIn: handleCrendentialsSignIn,
    googleSignIn: googleLogin,
  };
}
