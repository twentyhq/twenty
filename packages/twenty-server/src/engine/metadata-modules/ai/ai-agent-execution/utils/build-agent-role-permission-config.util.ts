import { isDefined } from 'twenty-shared/utils';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

// The agent role stays first: it is the role explicit object grants are
// resolved against. A run-as role only ever narrows it further.
export const buildAgentRolePermissionConfig = ({
  agentRoleId,
  runAsRoleId,
}: {
  agentRoleId: string;
  runAsRoleId?: string;
}): RolePermissionConfig => {
  if (!isDefined(runAsRoleId) || runAsRoleId === agentRoleId) {
    return { intersectionOf: [agentRoleId] };
  }

  return { intersectionOf: [agentRoleId, runAsRoleId] };
};
