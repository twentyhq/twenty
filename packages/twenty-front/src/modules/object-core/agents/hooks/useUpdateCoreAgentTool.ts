import { useUpdateCoreAgentRole } from '@/object-core/agents/hooks/useUpdateCoreAgentRole';
import { updateCoreAgentToolAccess } from '@/object-core/agents/utils/updateCoreAgentToolAccess';
import { settingsPermissionFlagDefinitionsState } from '@/settings/roles/states/settingsPermissionFlagDefinitionsState';
import { useStore } from 'jotai';
import { TOOL_PERMISSION_FLAGS } from 'twenty-shared/constants';
import { v4 } from 'uuid';

export const useUpdateCoreAgentTool = ({
  agentId,
}: { agentId?: string } = {}) => {
  const store = useStore();
  const { updateCoreAgentRole } = useUpdateCoreAgentRole({ agentId });

  const updateCoreAgentTool = ({
    toolKey,
    isEnabled,
  }: {
    toolKey: string;
    isEnabled: boolean;
  }) => {
    const availableToolKeys = [
      ...TOOL_PERMISSION_FLAGS,
      ...store
        .get(settingsPermissionFlagDefinitionsState.atom)
        .filter((definition) => definition.permissionType === 'tool')
        .map((definition) => definition.key),
    ];
    updateCoreAgentRole((role) =>
      updateCoreAgentToolAccess({
        role,
        toolKey,
        isEnabled,
        availableToolKeys,
        createPermissionId: v4,
      }),
    );
  };

  return { updateCoreAgentTool };
};
