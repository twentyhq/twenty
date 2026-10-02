import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';

// The agent role comes first: explicit object grants are read from the first role of the intersection
export const buildAgentRolePermissionConfig = ({
  agentRoleId,
  principalRoleIds,
}: {
  agentRoleId: string;
  principalRoleIds: string[];
}): RolePermissionConfig => ({
  intersectionOf: [...new Set([agentRoleId, ...principalRoleIds])],
});
