import { type AgentRoleRestrictions } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-role-restrictions.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';

export const buildAgentRolePermissionConfig = ({
  agentRoleId,
  roleRestrictions = {},
}: {
  agentRoleId: string | undefined;
  roleRestrictions?: AgentRoleRestrictions;
}): RolePermissionConfig => ({
  intersectionOf: { ...roleRestrictions, agentRoleId: agentRoleId ?? null },
});
