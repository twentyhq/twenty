import { isDefined } from 'twenty-shared/utils';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export const buildAgentRolePermissionConfig = ({
  agentRoleId,
  runAsRoleId,
}: {
  agentRoleId: string;
  runAsRoleId?: string;
}): RolePermissionConfig => {
  if (isDefined(runAsRoleId)) {
    return { intersectionOf: [runAsRoleId] };
  }

  return { intersectionOf: [agentRoleId] };
};
