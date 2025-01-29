import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';

export const useReadWorkspaceUrlFromCurrentLocation = () => {
  const { isOnAWorkspace } = useIsCurrentLocationOnAWorkspace();

  return {
    workspaceUrl: isOnAWorkspace ? window.location.hostname : undefined,
  };
};
