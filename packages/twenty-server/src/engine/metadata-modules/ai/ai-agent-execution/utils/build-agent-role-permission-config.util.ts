import { isDefined } from 'twenty-shared/utils';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

// In run-as mode the agent role is the ceiling and the member role the floor:
// the agent can never do more than the person asking, nor more than the role
// its owner scoped it to. The set guards the permission check, which rejects
// a duplicated role id when the member holds the agent role itself.
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
