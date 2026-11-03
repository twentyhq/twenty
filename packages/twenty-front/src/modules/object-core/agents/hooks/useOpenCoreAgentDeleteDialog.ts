import { useCoreAgentEditScope } from '@/object-core/agents/hooks/useCoreAgentEditScope';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getIsMetadataItemCustom } from '@/object-metadata/utils/getIsMetadataItemCustom';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const CORE_AGENT_DELETE_DIALOG_ID_PREFIX = 'core-agent-delete';

export const useOpenCoreAgentDeleteDialog = ({
  agentId,
}: { agentId?: string } = {}) => {
  const store = useStore();
  const {
    agentId: sessionAgentId,
    scopeId,
    sessionAtom,
  } = useCoreAgentEditScope(agentId);
  const { openDialog } = useDialog();
  const dialogId = `${CORE_AGENT_DELETE_DIALOG_ID_PREFIX}-${sessionAgentId}-${scopeId ?? 'main'}`;
  const openCoreAgentDeleteDialog = () => {
    const session = store.get(sessionAtom);
    const customApplicationId = store.get(currentWorkspaceState.atom)
      ?.workspaceCustomApplication?.id;
    const canDelete =
      isDefined(session) &&
      !session.isSaving &&
      !session.agent.isSystem &&
      store.get(permissionFlagMapSelector.atom)[
        PermissionFlagType.AI_SETTINGS
      ] &&
      getIsMetadataItemCustom(session.agent, customApplicationId);
    if (canDelete) {
      openDialog(dialogId);
    }
  };
  return { dialogId, openCoreAgentDeleteDialog };
};
