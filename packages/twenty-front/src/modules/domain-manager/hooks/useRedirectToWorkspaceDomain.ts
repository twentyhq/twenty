import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useRecoilValue } from 'recoil';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';

export const useRedirectToWorkspaceDomain = () => {
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();
  const { redirect } = useRedirect();

  const redirectToWorkspaceDomain = (
    subdomain: string,
    hostname?: string | null,
    pathname?: string,
    searchParams?: Record<string, string>,
  ) => {
    if (!isMultiWorkspaceEnabled) return;
    redirect(buildWorkspaceUrl(subdomain, hostname, pathname, searchParams));
  };

  return {
    redirectToWorkspaceDomain,
  };
};
