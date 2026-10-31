import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type RolePermissionConfig } from 'src/engine/permissions/principal/types/role-permission-config.type';

export type RecordCrudExecutionContext = {
  authContext: WorkspaceAuthContext;
  rolePermissionConfig?: RolePermissionConfig;
  slimResponse?: boolean;
};
