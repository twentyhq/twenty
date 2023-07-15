import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import {
  useChallengeMutation,
  useSignUpMutation,
  useVerifyMutation,
} from '~/generated/graphql';

import { currentUserState } from '../states/currentUserState';
import { isAuthenticatingState } from '../states/isAuthenticatingState';
import { tokenPairState } from '../states/tokenPairState';

export function useAuth() {
  const [, setTokenPair] = useRecoilState(tokenPairState);
  const [, setCurrentUser] = useRecoilState(currentUserState);
  const [, setIsAuthenticating] = useRecoilState(isAuthenticatingState);

  const [challenge] = useChallengeMutation();
  const [signUp] = useSignUpMutation();
  const [verify] = useVerifyMutation();

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

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      const { loginToken } = await handleChallenge(email, password);

      await handleVerify(loginToken.token);
    },
    [handleChallenge, handleVerify],
  );

  const handleLogout = useCallback(() => {
    setTokenPair(null);
    setCurrentUser(null);
  }, [setTokenPair, setCurrentUser]);

  const handleSignUp = useCallback(
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

  return {
    challenge: handleChallenge,
    verify: handleVerify,
    login: handleLogin,
    signUp: handleSignUp,
    logout: handleLogout,
  };
}
