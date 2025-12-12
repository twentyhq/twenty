import type { Role } from 'twenty-shared/application';

export type RoleConfig = Omit<
  Role,
  | 'canAccessAllTools'
  | 'canUpdateAllSettings'
  | 'canBeAssignedToAgents'
  | 'canBeAssignedToUsers'
  | 'canBeAssignedToApiKeys'
  | 'canBeAssignedToApplications'
>;
