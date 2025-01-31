import { WorkspaceUrls } from '~/generated/graphql';
import { useIsForceSubdomainUrlEnable } from '@/domain-manager/hooks/useIsForceSubdomainUrlEnable';

export const useGetWorkspaceUrlFromWorkspaceUrls = () => {
  const { isForceSubdomainUrlEnable } = useIsForceSubdomainUrlEnable();

  const getWorkspaceUrl = (workspaceUrls: WorkspaceUrls) => {
    return isForceSubdomainUrlEnable
      ? workspaceUrls.subdomainUrl
      : (workspaceUrls.customUrl ?? workspaceUrls.subdomainUrl);
  };

  return {
    getWorkspaceUrl,
  };
};
