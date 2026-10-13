import { isNull, isUndefined } from '@sniptt/guards';
import { isNonEmptyArray } from 'twenty-shared/utils';

// The agent only narrows the caller's own roles, so it never stands in for a missing one
export const applyAgentRoleRestriction = ({
  roleIds,
  agentRoleId,
}: {
  roleIds: string[];
  agentRoleId: string | null | undefined;
}): string[] => {
  if (isUndefined(agentRoleId) || !isNonEmptyArray(roleIds)) {
    return roleIds;
  }

  if (isNull(agentRoleId)) {
    return [];
  }

  return roleIds.includes(agentRoleId) ? roleIds : [...roleIds, agentRoleId];
};
