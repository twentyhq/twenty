import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useCoreAgentEditScope } from '@/object-core/agents/hooks/useCoreAgentEditScope';
import { type CoreAgentEditSession } from '@/object-core/agents/types/CoreAgentEditSession';
import { getIsMetadataItemCustom } from '@/object-metadata/utils/getIsMetadataItemCustom';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useUpdateCoreAgentEditSession = ({
  agentId,
}: { agentId?: string } = {}) => {
  const store = useStore();
  const { sessionAtom } = useCoreAgentEditScope(agentId);
  const updateCoreAgentEditSession = (
    update: (session: CoreAgentEditSession) => CoreAgentEditSession,
  ) => {
    const session = store.get(sessionAtom);
    if (
      !isDefined(session) ||
      session.agent.isSystem ||
      !store.get(permissionFlagMapSelector.atom)[
        PermissionFlagType.AI_SETTINGS
      ] ||
      !getIsMetadataItemCustom(
        session.agent,
        store.get(currentWorkspaceState.atom)?.workspaceCustomApplication?.id,
      )
    ) {
      return;
    }
    store.set(sessionAtom, update(session));
  };
  return { updateCoreAgentEditSession };
};
