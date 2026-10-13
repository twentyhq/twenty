import { type AgentRunRoleIds } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-role-ids.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';

export const buildAgentRolePermissionConfig = ({
  agentRoleId,
  agentRunRoleIds = {},
}: {
  agentRoleId: string | undefined;
  agentRunRoleIds?: AgentRunRoleIds;
}): RolePermissionConfig => ({
  intersectionOf: { ...agentRunRoleIds, agentRoleId: agentRoleId ?? null },
});
