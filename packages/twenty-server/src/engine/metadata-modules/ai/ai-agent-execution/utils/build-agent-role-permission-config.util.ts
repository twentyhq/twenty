import { isDefined } from 'twenty-shared/utils';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';

export const buildAgentRolePermissionConfig = ({
  agentRoleId,
  additionalRoleRestrictionIds = [],
}: {
  agentRoleId: string | undefined;
  additionalRoleRestrictionIds?: string[];
}): RolePermissionConfig => {
  // without a role the agent reads nothing, however its restrictions narrow it
  if (!isDefined(agentRoleId)) {
    return { intersectionOf: [] };
  }

  return {
    intersectionOf: [
      ...new Set([agentRoleId, ...additionalRoleRestrictionIds]),
    ],
  };
};
