import { type AgentRunRoleIds } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-role-ids.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';

export const buildAgentRolePermissionConfig = ({
  agentRoleId,
  runRoleIds = {},
}: {
  agentRoleId: string | undefined;
  runRoleIds?: AgentRunRoleIds;
}): RolePermissionConfig => ({
  intersectionOf: { ...runRoleIds, agentRoleId: agentRoleId ?? null },
});
