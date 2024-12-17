import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { AppPath } from '@/types/AppPath';
import { useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useImpersonateMutation } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';

export const useImpersonate = () => {
  const { clearSession } = useAuth();
  const { redirect } = useRedirect();
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
  const setTokenPair = useSetRecoilState(tokenPairState);
  const [impersonate] = useImpersonateMutation();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImpersonate = async (userId: string) => {
    if (!userId.trim()) {
      setError('Please enter a user ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const impersonateResult = await impersonate({
        variables: { userId },
      });

      if (isDefined(impersonateResult.errors)) {
        throw impersonateResult.errors;
      }

      if (!impersonateResult.data?.impersonate) {
        throw new Error('No impersonate result');
      }

      const { user, tokens } = impersonateResult.data.impersonate;
      await clearSession();
      setCurrentUser(user);
      setTokenPair(tokens);
      redirect(AppPath.Index);
    } catch (error) {
      setError('Failed to impersonate user. Please try again.');
      setIsLoading(false);
    }
  };

  return {
    handleImpersonate,
    isLoading,
    error,
    canImpersonate: currentUser?.canImpersonate,
  };
};
