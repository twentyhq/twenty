import { type WorkspaceUrls } from '~/generated/graphql';

export const getWorkspaceUrl = (workspaceUrls: WorkspaceUrls) => {
  return workspaceUrls.customUrl ?? workspaceUrls.subdomainUrl;
};
