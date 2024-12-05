import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useRecoilValue } from 'recoil';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';

export const useRedirectToWorkspaceDomain = () => {
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();

  const redirectToWorkspaceDomain = (
    subdomain: string,
    pathname?: string,
    searchParams?: Record<string, string>,
  ) => {
    if (!isMultiWorkspaceEnabled) return;
    window.location.href = buildWorkspaceUrl(subdomain, pathname, searchParams);
  };

  return {
    redirectToWorkspaceDomain,
  };
};
