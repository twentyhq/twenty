import { currentUserState } from '@/auth/states/currentUserState';
import { AppPath } from '@/types/AppPath';
import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useImpersonateMutation } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { useAuth } from '@/auth/hooks/useAuth';

export const useImpersonate = () => {
  const [currentUser] = useRecoilState(currentUserState);
  const [impersonate] = useImpersonateMutation();
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();
  const { clearSession } = useAuth();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImpersonate = async (userId: string, workspaceId: string) => {
    if (!userId.trim()) {
      setError('Please enter a user ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const impersonateResult = await impersonate({
        variables: { userId, workspaceId },
      });

      if (isDefined(impersonateResult.errors)) {
        throw impersonateResult.errors;
      }

      if (!impersonateResult.data?.impersonate) {
        throw new Error('No impersonate result');
      }

      const { loginToken, workspace } = impersonateResult.data.impersonate;

      if (!isMultiWorkspaceEnabled) {
        await clearSession();

        return (window.location.href = buildWorkspaceUrl(
          undefined,
          AppPath.Verify,
          {
            loginToken: loginToken.token,
          },
        ));
      }

      return redirectToWorkspaceDomain(workspace.subdomain, AppPath.Verify, {
        loginToken: loginToken.token,
      });
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
