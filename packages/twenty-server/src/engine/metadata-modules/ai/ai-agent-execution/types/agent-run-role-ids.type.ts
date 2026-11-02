import { type RoleIdsBySource } from 'src/engine/permissions/principal/types/role-permission-config.type';

export type AgentRunRoleIds = Omit<RoleIdsBySource, 'agentRoleId'>;
