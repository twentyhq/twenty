import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';

// Built by an authenticated entrypoint or a worker that re-resolved the
// person's permissions; never from model arguments or browser state.
export type SetuAiActionActor = {
  workspaceId: string;
  userWorkspaceId: string;
  authContext: WorkspaceAuthContext;
  rolePermissionConfig: RolePermissionConfig;
};
