import { type ObjectRecordProperties } from 'src/engine/core-modules/record-crud/types/object-record-properties.type';
import { type ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export type CreateRecordParams = {
  objectName: string;
  objectRecord: ObjectRecordProperties;
  workspaceId: string;
  rolePermissionConfig?: RolePermissionConfig;
  createdBy?: ActorMetadata;
};
