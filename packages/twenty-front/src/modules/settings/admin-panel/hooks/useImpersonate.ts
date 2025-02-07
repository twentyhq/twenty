import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { isAppWaitingForFreshObjectMetadataState } from '@/object-metadata/states/isAppWaitingForFreshObjectMetadataState';
import { AppPath } from '@/types/AppPath';
import { useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';
import { useImpersonateMutation } from '~/generated/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';

export const useImpersonate = () => {
  const [currentUser] = useRecoilState(currentUserState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const setIsAppWaitingForFreshObjectMetadata = useSetRecoilState(
    isAppWaitingForFreshObjectMetadataState,
  );

  const { getAuthTokensFromLoginToken } = useAuth();

  const [impersonate] = useImpersonateMutation();
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

      if (workspace.id === currentWorkspace?.id) {
        setIsAppWaitingForFreshObjectMetadata(true);
        await getAuthTokensFromLoginToken(loginToken.token);
        setIsAppWaitingForFreshObjectMetadata(false);
        return;
      }

      return redirectToWorkspaceDomain(
        getWorkspaceUrl(workspace.workspaceUrls),
        AppPath.Verify,
        {
          loginToken: loginToken.token,
        },
      );
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
