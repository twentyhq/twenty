import { WorkspaceUrls } from '~/generated/graphql';

export const useGetWorkspaceUrlFromWorkspaceUrls = () => {

  const getWorkspaceUrl = (workspaceUrls: WorkspaceUrls) => {
    return workspaceUrls.customUrl ?? workspaceUrls.subdomainUrl
  };

  return {
    getWorkspaceUrl,
  };
};
