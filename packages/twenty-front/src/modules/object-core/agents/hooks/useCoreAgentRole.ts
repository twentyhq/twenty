import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { coreAgentDraftRoleFamilyState } from '@/object-core/agents/states/coreAgentDraftRoleFamilyState';
import { coreAgentInitialDraftRoleFamilyState } from '@/object-core/agents/states/coreAgentInitialDraftRoleFamilyState';
import { coreAgentNewRoleIdFamilyState } from '@/object-core/agents/states/coreAgentNewRoleIdFamilyState';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { getRoleDirtyFields } from '@/settings/roles/role/utils/getRoleDirtyFields';
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
  const coreAgentDraftRole = useAtomFamilyStateValue(
    coreAgentDraftRoleFamilyState,
    agent.id,
  );
  const coreAgentInitialDraftRole = useAtomFamilyStateValue(
    coreAgentInitialDraftRoleFamilyState,
    agent.id,
  );
  const setCoreAgentDraftRole = useSetAtomFamilyState(
    coreAgentDraftRoleFamilyState,
    agent.id,
  );

  const isDraftRoleReady =
    isNonEmptyString(roleId) &&
    coreAgentDraftRole.id === roleId &&
    coreAgentInitialDraftRole?.id === roleId;

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
  ) => setCoreAgentDraftRole(getNextRole);

  return {
    roleId,
    isNewRole,
    role: isDraftRoleReady ? coreAgentDraftRole : undefined,
    updateRole,
    canEditRole,
    isRoleDirty:
      isDraftRoleReady &&
      Object.keys(
        getRoleDirtyFields(coreAgentDraftRole, coreAgentInitialDraftRole),
      ).length > 0,
  };
};
