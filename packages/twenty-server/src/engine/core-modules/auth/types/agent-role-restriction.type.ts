// A null roleId (agent without a role, or deleted) denies everything, as for the agent's own tools
export type AgentRoleRestriction = {
  agentId: string;
  roleId: string | null;
};
