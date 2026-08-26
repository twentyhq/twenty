import { isNonEmptyArray } from 'twenty-shared/utils';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export const buildAgentRolePermissionConfig = ({
  agentRoleId,
  runAsRoleIds,
}: {
  agentRoleId: string;
  runAsRoleIds?: string[];
}): RolePermissionConfig => {
  // A run-as intersection of one role caps at that role alone; of two
  // (member plus a channel ceiling) caps at whichever is tighter per operation.
  if (isNonEmptyArray(runAsRoleIds)) {
    return { intersectionOf: runAsRoleIds };
  }

  return { intersectionOf: [agentRoleId] };
};
