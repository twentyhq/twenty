import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useCoreAgentEditScope } from '@/object-core/agents/hooks/useCoreAgentEditScope';
import { isCoreAgentRoleEditable } from '@/object-core/agents/utils/isCoreAgentRoleEditable';
import { getIsMetadataItemCustom } from '@/object-metadata/utils/getIsMetadataItemCustom';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useUpdateCoreAgentRole = ({
  agentId,
}: { agentId?: string } = {}) => {
  const store = useStore();
  const {
    sessionAtom,
    scopeId,
    agentId: sessionAgentId,
  } = useCoreAgentEditScope(agentId);

  const updateCoreAgentRole = (
    update: (role: RoleWithPartialMembers) => RoleWithPartialMembers,
  ) => {
    const session = store.get(sessionAtom);
    const roleId = session?.roleId;

    if (!isDefined(session) || !isDefined(roleId)) {
      return;
    }

    const workspaceCustomApplicationId = store.get(currentWorkspaceState.atom)
      ?.workspaceCustomApplication?.id;
    const flags = store.get(permissionFlagMapSelector.atom);
    const isLocalRole = !isDefined(session.agent.roleId);
    const persistedRole = store.get(
      settingsPersistedRoleFamilyState.atomFamily(roleId),
    );
    const isExclusiveRole =
      isLocalRole ||
      isCoreAgentRoleEditable({
        role: persistedRole,
        agentId: sessionAgentId,
        workspaceCustomApplicationId,
      });
    const hasRoleConflict = !isLocalRole && session.agent.roleId !== roleId;

    if (
      !flags[PermissionFlagType.AI_SETTINGS] ||
      !flags[PermissionFlagType.ROLES] ||
      session.agent.isSystem ||
      !getIsMetadataItemCustom(session.agent, workspaceCustomApplicationId) ||
      !isExclusiveRole ||
      hasRoleConflict
    ) {
      return;
    }

    const roleAtom = settingsDraftRoleFamilyState.getAtom(roleId, scopeId);
    const role = store.get(roleAtom);

    if (role.id === roleId) {
      store.set(roleAtom, update(role));
    }
  };

  return { updateCoreAgentRole };
};
