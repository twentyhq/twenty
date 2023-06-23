import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { useChallengeMutation, useVerifyMutation } from '~/generated/graphql';

import { tokenService } from '../services/TokenService';
import { currentUserState } from '../states/currentUserState';
import { isAuthenticatingState } from '../states/isAuthenticatingState';

export function useAuth() {
  const [, setCurrentUser] = useRecoilState(currentUserState);
  const [, setIsAuthenticating] = useRecoilState(isAuthenticatingState);

  const [challenge] = useChallengeMutation();
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

      tokenService.setTokenPair(verifyResult.data?.verify.tokens);

      setIsAuthenticating(false);
      setCurrentUser(verifyResult.data?.verify.user);

      return verifyResult.data?.verify;
    },
    [setCurrentUser, setIsAuthenticating, verify],
  );

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      const { loginToken } = await handleChallenge(email, password);

      await handleVerify(loginToken.token);
    },
    [handleChallenge, handleVerify],
  );

  const handleLogout = useCallback(() => {
    tokenService.removeTokenPair();
  }, []);

  return {
    challenge: handleChallenge,
    verify: handleVerify,
    login: handleLogin,
    logout: handleLogout,
  };
}
