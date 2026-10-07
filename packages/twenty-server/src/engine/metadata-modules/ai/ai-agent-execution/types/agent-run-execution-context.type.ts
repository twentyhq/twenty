import { type ActorMetadata } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';

// The permissions a run acts with, which its caller derives on each segment instead of the engine storing them
export type AgentRunExecutionContext = {
  authContext: WorkspaceAuthContext;
  actorContext?: ActorMetadata;
  userWorkspaceId: string | null;
  // what the run itself can read, such as the record an awaited event is about
  rolePermissionConfig: RolePermissionConfig;
  // narrows the agent's own role, such as to the application a run belongs to
  additionalRoleRestrictionIds?: string[];
};
