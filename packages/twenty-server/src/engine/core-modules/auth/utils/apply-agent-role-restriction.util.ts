import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type AgentRoleRestriction } from 'src/engine/core-modules/auth/types/agent-role-restriction.type';

// The agent only narrows the caller's own roles, so it never stands in for a missing one
export const applyAgentRoleRestriction = ({
  roleIds,
  agentRoleRestriction,
}: {
  roleIds: string[];
  agentRoleRestriction: AgentRoleRestriction | undefined;
}): string[] => {
  if (!isDefined(agentRoleRestriction) || !isNonEmptyArray(roleIds)) {
    return roleIds;
  }

  if (!isDefined(agentRoleRestriction.roleId)) {
    return [];
  }

  return roleIds.includes(agentRoleRestriction.roleId)
    ? roleIds
    : [...roleIds, agentRoleRestriction.roleId];
};
