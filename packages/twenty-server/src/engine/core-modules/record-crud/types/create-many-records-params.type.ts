import { type ActorMetadata } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ObjectRecordProperties } from 'src/engine/core-modules/record-crud/types/object-record-properties.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export type CreateManyRecordsParams = {
  objectName: string;
  objectRecords: ObjectRecordProperties[];
  authContext: WorkspaceAuthContext;
  rolePermissionConfig?: RolePermissionConfig;
  createdBy?: ActorMetadata;
  slimResponse?: boolean;
};
