import { type RoleRestrictionsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';

export type AgentRoleRestrictions = Omit<RoleRestrictionsBySource, 'agent'>;
