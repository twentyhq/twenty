import { isDefined } from 'twenty-shared/utils';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';

export const buildAgentRolePermissionConfig = ({
  agentRoleId,
  runAsRoleId,
  additionalRoleRestrictionIds = [],
}: {
  agentRoleId: string | undefined;
  runAsRoleId?: string;
  additionalRoleRestrictionIds?: string[];
}): RolePermissionConfig => {
  const baseRoleId = isDefined(runAsRoleId) ? runAsRoleId : agentRoleId;

  // without a role the agent reads nothing, however its restrictions narrow it
  if (!isDefined(baseRoleId)) {
    return { intersectionOf: [] };
  }

  return {
    intersectionOf: [...new Set([baseRoleId, ...additionalRoleRestrictionIds])],
  };
};
