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
  // without a role the agent reads nothing, however its restrictions narrow it
  if (!isDefined(agentRoleId)) {
    return { intersectionOf: [] };
  }

  return {
    intersectionOf: [
      ...new Set(
        [agentRoleId, runAsRoleId, ...additionalRoleRestrictionIds].filter(
          isDefined,
        ),
      ),
    ],
  };
};
