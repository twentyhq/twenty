import { useSearchParams } from 'react-router-dom';
import { WorkspaceUrls } from '~/generated/graphql';

export const useGetWorkspaceUrlFromWorkspaceUrls = () => {
  const [searchParams] = useSearchParams();

  const getWorkspaceUrl = (workspaceUrls: WorkspaceUrls) => {
    return searchParams.get('force-subdomain-url')
      ? workspaceUrls.subdomainUrl
      : (workspaceUrls.customUrl ?? workspaceUrls.subdomainUrl);
  };

  return {
    getWorkspaceUrl,
  };
};
