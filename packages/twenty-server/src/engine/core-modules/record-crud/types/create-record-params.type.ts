import { type ObjectRecordProperties } from 'src/engine/core-modules/record-crud/types/object-record-properties.type';

export type CreateRecordParams = {
  objectName: string;
  objectRecord: ObjectRecordProperties;
  workspaceId: string;
  roleId?: string;
};
