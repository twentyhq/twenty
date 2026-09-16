import { isDefined } from 'twenty-shared/utils';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

// In run-as mode the agent can do no more than the person asking, nor more
// than the role its owner scoped it to.
export const buildAgentRolePermissionConfig = ({
  agentRoleId,
  runAsRoleId,
}: {
  agentRoleId: string;
  runAsRoleId?: string;
}): RolePermissionConfig => {
  if (isDefined(runAsRoleId)) {
    return { intersectionOf: [...new Set([agentRoleId, runAsRoleId])] };
  }

  return { intersectionOf: [agentRoleId] };
};
