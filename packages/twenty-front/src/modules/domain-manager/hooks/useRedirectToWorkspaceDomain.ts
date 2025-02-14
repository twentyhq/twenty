import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useRecoilValue } from 'recoil';

export const useRedirectToWorkspaceDomain = () => {
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();
  const { redirect } = useRedirect();

  const redirectToWorkspaceDomain = (
    baseUrl: string,
    pathname?: string,
    searchParams?: Record<string, string | boolean>,
  ) => {
    if (!isMultiWorkspaceEnabled) return;
    redirect(buildWorkspaceUrl(baseUrl, pathname, searchParams));
  };

  return {
    redirectToWorkspaceDomain,
  };
};
