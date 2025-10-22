import { type ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export type RecordCrudExecutionContext = {
  workspaceId: string;
  rolePermissionConfig?: RolePermissionConfig;
};

export type CreateRecordExecutionContext = RecordCrudExecutionContext & {
  createdBy?: ActorMetadata;
};
