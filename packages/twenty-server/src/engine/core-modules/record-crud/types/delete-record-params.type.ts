import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export type DeleteRecordParams = {
  objectName: string;
  objectRecordId: string;
  workspaceId: string;
  rolePermissionConfig?: RolePermissionConfig;
  soft?: boolean;
};
