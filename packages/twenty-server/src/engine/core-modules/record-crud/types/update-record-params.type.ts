import { type ObjectRecordProperties } from 'src/engine/core-modules/record-crud/types/object-record-properties.type';

export type UpdateRecordParams = {
  objectName: string;
  objectRecordId: string;
  objectRecord: ObjectRecordProperties;
  fieldsToUpdate?: string[];
  workspaceId: string;
  roleId?: string;
};
