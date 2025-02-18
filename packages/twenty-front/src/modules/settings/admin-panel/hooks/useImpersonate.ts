import { useAuth } from '@/auth/hooks/useAuth';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { isAppWaitingForFreshObjectMetadataState } from '@/object-metadata/states/isAppWaitingForFreshObjectMetadataState';
import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';
import { useImpersonateMutation } from '~/generated/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
export const useImpersonate = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const setIsAppWaitingForFreshObjectMetadata = useSetRecoilState(
    isAppWaitingForFreshObjectMetadataState,
  );
  const { getAuthTokensFromLoginToken } = useAuth();
  const [impersonate] = useImpersonateMutation();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackBar } = useSnackBar();
  const handleImpersonate = async (userId: string, workspaceId: string) => {
    setIsLoading(true);

    try {
      const impersonateResult = await impersonate({
        variables: { userId, workspaceId },
      });

      if (isDefined(impersonateResult.errors)) {
        throw impersonateResult.errors;
      }

      if (!impersonateResult.data?.impersonate) {
        enqueueSnackBar('Failed to impersonate user. Please try again.', {
          variant: SnackBarVariant.Error,
        });
        setIsLoading(false);
        return;
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
      enqueueSnackBar('Failed to impersonate user. Please try again.', {
        variant: SnackBarVariant.Error,
      });
      setIsLoading(false);
    }
  };
  return {
    handleImpersonate,
    isImpersonateLoading: isLoading,
  };
};
