import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { AppPath } from '@/types/AppPath';
import { WorkspaceUrls } from '~/generated/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';

export const useImpersonationRedirect = () => {
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();

  const executeImpersonationRedirect = async (
    workspaceUrls: WorkspaceUrls,
    loginToken: string,
  ) => {
    return await redirectToWorkspaceDomain(
      getWorkspaceUrl(workspaceUrls),
      AppPath.Verify,
      { loginToken },
    );
  };

  return { executeImpersonationRedirect };
};
