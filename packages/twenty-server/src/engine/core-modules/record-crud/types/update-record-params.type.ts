import { type ObjectRecordProperties } from 'src/engine/core-modules/record-crud/types/object-record-properties.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export type UpdateRecordParams = {
  objectName: string;
  objectRecordId: string;
  objectRecord: ObjectRecordProperties;
  fieldsToUpdate?: string[];
  workspaceId: string;
  rolePermissionConfig?: RolePermissionConfig;
};
