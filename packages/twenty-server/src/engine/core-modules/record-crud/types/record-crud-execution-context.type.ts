import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export type RecordCrudExecutionContext = {
  authContext: WorkspaceAuthContext;
  rolePermissionConfig?: RolePermissionConfig;
  slimResponse?: boolean;
};
