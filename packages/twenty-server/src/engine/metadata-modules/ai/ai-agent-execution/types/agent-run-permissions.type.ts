import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type PermissionScope } from 'src/engine/permissions/principal/types/permission-scope.type';

export type AgentRunPermissions = {
  authContext: WorkspaceAuthContext;
  ephemeralRole?: PermissionScope;
};
