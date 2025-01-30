import { useSearchParams } from 'react-router-dom';
import { workspaceUrls } from '~/generated/graphql';

export const useGetWorkspaceUrlFromWorkspaceUrls = () => {
  const [searchParams] = useSearchParams();

  const getWorkspaceUrl = (workspaceUrls: workspaceUrls) => {
    return searchParams.get('force-subdomain-url')
      ? workspaceUrls.subdomainUrl
      : (workspaceUrls.customUrl ?? workspaceUrls.subdomainUrl);
  };

  return {
    getWorkspaceUrl,
  };
};
