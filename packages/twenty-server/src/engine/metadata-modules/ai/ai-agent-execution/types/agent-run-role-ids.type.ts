import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';

export type AgentRunRoleIds = Omit<RoleIdsBySource, 'agentRoleId'>;
