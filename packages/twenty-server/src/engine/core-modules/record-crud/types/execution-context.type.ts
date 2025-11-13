import { type ActorMetadata } from 'twenty-shared/types';

import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export type RecordCrudExecutionContext = {
  workspaceId: string;
  rolePermissionConfig?: RolePermissionConfig;
  userWorkspaceId?: string;
  apiKey?: ApiKeyEntity;
  createdBy?: ActorMetadata;
};

export type CreateRecordExecutionContext = RecordCrudExecutionContext & {
  createdBy?: ActorMetadata;
};
