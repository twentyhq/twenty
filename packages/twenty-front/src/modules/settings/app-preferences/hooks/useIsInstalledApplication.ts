import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsInstalledApplication = (
  applicationId: string | undefined,
) => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  return (currentWorkspace?.installedApplications ?? []).some(
    ({ id }) => id === applicationId,
  );
};
