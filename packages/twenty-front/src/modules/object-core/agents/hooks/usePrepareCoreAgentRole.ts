import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getIsMetadataItemCustom } from '@/object-metadata/utils/getIsMetadataItemCustom';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useCoreAgentEditScope } from '@/object-core/agents/hooks/useCoreAgentEditScope';
import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const usePrepareCoreAgentRole = ({
  agentId,
}: { agentId?: string } = {}) => {
  const store = useStore();
  const {
    agentId: sessionAgentId,
    scopeId,
    sessionAtom,
  } = useCoreAgentEditScope(agentId);

  const prepareCoreAgentRole = () => {
    const session = store.get(sessionAtom);

    if (
      !isDefined(session) ||
      session.isSaving ||
      isDefined(session.roleId) ||
      session.agent.isSystem ||
      !store.get(permissionFlagMapSelector.atom)[
        PermissionFlagType.AI_SETTINGS
      ] ||
      !getIsMetadataItemCustom(
        session.agent,
        store.get(currentWorkspaceState.atom)?.workspaceCustomApplication?.id,
      ) ||
      !store.get(permissionFlagMapSelector.atom)[PermissionFlagType.ROLES]
    ) {
      return;
    }

    const roleId = `agent-${sessionAgentId}-role-draft`;
    store.set(settingsDraftRoleFamilyState.getAtom(roleId, scopeId), {
      ...DEFAULT_SETTINGS_DRAFT_ROLE,
      id: roleId,
      label: session.agent.label,
      isEditable: true,
      canBeAssignedToAgents: true,
    });
    store.set(sessionAtom, { ...session, roleId });
  };

  return { prepareCoreAgentRole };
};
