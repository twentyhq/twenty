import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';

export type MergeRecordsParams = {
  objectName: string;
  ids: string[];
  conflictPriorityIndex: number;
  dryRun?: boolean;
  authContext: WorkspaceAuthContext;
  rolePermissionConfig?: RolePermissionConfig;
};
