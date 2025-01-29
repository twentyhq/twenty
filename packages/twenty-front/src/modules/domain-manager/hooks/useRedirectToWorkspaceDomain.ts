import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useRecoilValue } from 'recoil';

export const useRedirectToWorkspaceDomain = () => {
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();
  const { redirect } = useRedirect();

  const redirectToWorkspaceDomain = (
    workspaceUrl: string,
    pathname?: string,
    searchParams?: Record<string, string>,
  ) => {
    if (!isMultiWorkspaceEnabled) return;
    redirect(buildWorkspaceUrl(workspaceUrl, pathname, searchParams));
  };

  return {
    redirectToWorkspaceDomain,
  };
};
