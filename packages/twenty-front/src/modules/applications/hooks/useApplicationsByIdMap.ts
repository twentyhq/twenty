import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';

export type ApplicationsByIdValue = {
  id: string;
  name: string;
  universalIdentifier: string;
};

export const useApplicationsByIdMap = (): Map<string, ApplicationsByIdValue> => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  return useMemo(() => {
    const map = new Map<string, ApplicationsByIdValue>();

    for (const application of currentWorkspace?.installedApplications ?? []) {
      map.set(application.id, {
        id: application.id,
        name: application.name,
        universalIdentifier: application.universalIdentifier,
      });
    }

    return map;
  }, [currentWorkspace?.installedApplications]);
};
