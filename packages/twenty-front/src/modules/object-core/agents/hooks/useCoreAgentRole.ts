import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { coreAgentNewRoleIdFamilyState } from '@/object-core/agents/states/coreAgentNewRoleIdFamilyState';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { getRoleDirtyFields } from '@/settings/roles/role/utils/getRoleDirtyFields';
import { settingsDraftRoleBaseFamilyState } from '@/settings/roles/states/settingsDraftRoleBaseFamilyState';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const useCoreAgentRole = (
  agent: Pick<CoreAgent, 'id'> & Partial<Pick<CoreAgent, 'roleId'>>,
) => {
  const coreAgentNewRoleId = useAtomFamilyStateValue(
    coreAgentNewRoleIdFamilyState,
    agent.id,
  );

  const isNewRole = !isNonEmptyString(agent.roleId);
  const roleId = (isNewRole ? coreAgentNewRoleId : agent.roleId) ?? '';

  const settingsPersistedRole = useAtomFamilyStateValue(
    settingsPersistedRoleFamilyState,
    roleId,
  );
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const settingsDraftRoleBase = useAtomFamilyStateValue(
    settingsDraftRoleBaseFamilyState,
    roleId,
  );
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const isDraftRoleReady =
    isNonEmptyString(roleId) &&
    settingsDraftRole.id === roleId &&
    settingsDraftRoleBase?.id === roleId;

  const isRoleExclusiveToAgent =
    isDefined(settingsPersistedRole) &&
    settingsPersistedRole.workspaceMembers.length === 0 &&
    settingsPersistedRole.apiKeys.length === 0 &&
    settingsPersistedRole.agents.every(
      (roleAgent) => roleAgent.id === agent.id,
    );

  const canEditRole =
    isNewRole ||
    (isDefined(settingsPersistedRole) &&
      settingsPersistedRole.isEditable &&
      isRoleExclusiveToAgent);

  const updateRole = (
    getNextRole: (role: RoleWithPartialMembers) => RoleWithPartialMembers,
  ) => setSettingsDraftRole(getNextRole);

  return {
    roleId,
    isNewRole,
    role: isDraftRoleReady ? settingsDraftRole : undefined,
    updateRole,
    canEditRole,
    isRoleDirty:
      isDraftRoleReady &&
      Object.keys(getRoleDirtyFields(settingsDraftRole, settingsDraftRoleBase))
        .length > 0,
  };
};
