import { isOwnedByInstalledApplication } from '@/applications/utils/isOwnedByInstalledApplication';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsCoreAgentReadOnly = (
  agent: Pick<CoreAgent, 'applicationId' | 'isCustom'>,
) => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const isOwnedByApplication = isOwnedByInstalledApplication({
    applicationId: agent.applicationId,
    workspaceCustomApplicationId:
      currentWorkspace?.workspaceCustomApplication?.id,
  });

  return isOwnedByApplication || !agent.isCustom;
};
