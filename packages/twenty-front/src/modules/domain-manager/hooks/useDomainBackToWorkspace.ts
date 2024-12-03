import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useRecoilValue } from 'recoil';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';

export const useDomainBackToWorkspace = () => {
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const buildWorkspaceUrl = useBuildWorkspaceUrl();

  return (
    subdomain: string,
    onPage?: string,
    searchParams?: Record<string, string>,
  ) => {
    if (!isMultiWorkspaceEnabled) return;
    window.location.href = buildWorkspaceUrl(subdomain, onPage, searchParams);
  };
};
