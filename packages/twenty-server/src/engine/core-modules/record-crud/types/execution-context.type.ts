import { type ActorMetadata } from 'twenty-shared/types';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export type RecordCrudExecutionContext = {
  workspaceId: string;
  rolePermissionConfig?: RolePermissionConfig;
};

export type CreateRecordExecutionContext = RecordCrudExecutionContext & {
  createdBy?: ActorMetadata;
};
