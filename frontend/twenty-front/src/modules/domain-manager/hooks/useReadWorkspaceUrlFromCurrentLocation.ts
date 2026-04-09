import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';

export const useReadWorkspaceUrlFromCurrentLocation = () => {
  const { isOnAWorkspace } = useIsCurrentLocationOnAWorkspace();

  return {
    currentLocationHostname: isOnAWorkspace
      ? window.location.hostname
      : undefined,
  };
};
