import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getResolvedApplicationDescription } from '@/applications/utils/getResolvedApplicationDescription';

type ApplicationLike = {
  id?: string | null;
  universalIdentifier?: string | null;
  description?: string | null;
};

export const useResolvedApplicationDescription = (
  application: ApplicationLike | null | undefined,
): string => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  return getResolvedApplicationDescription({ application, currentWorkspace });
};
