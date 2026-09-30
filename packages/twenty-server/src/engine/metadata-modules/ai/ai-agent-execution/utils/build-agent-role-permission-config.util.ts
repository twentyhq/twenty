import { isDefined } from 'twenty-shared/utils';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';

export const buildAgentRolePermissionConfig = ({
  agentRoleId,
  runAsRoleId,
  additionalRoleRestrictionIds = [],
}: {
  agentRoleId: string;
  runAsRoleId?: string;
  additionalRoleRestrictionIds?: string[];
}): RolePermissionConfig => {
  // Restrictions must narrow the selected role, never replace it.
  const baseRoleId = isDefined(runAsRoleId) ? runAsRoleId : agentRoleId;

  return {
    intersectionOf: [...new Set([baseRoleId, ...additionalRoleRestrictionIds])],
  };
};
