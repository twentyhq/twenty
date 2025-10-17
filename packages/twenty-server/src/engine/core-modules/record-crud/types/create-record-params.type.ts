import { type ObjectRecordProperties } from 'src/engine/core-modules/record-crud/types/object-record-properties.type';
import { type ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';

export type CreateRecordParams = {
  objectName: string;
  objectRecord: ObjectRecordProperties;
  workspaceId: string;
  roleId?: string;
  createdBy?: ActorMetadata;
};
