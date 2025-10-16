import { type ObjectRecordProperties } from 'src/engine/core-modules/record-crud/types/object-record-properties.type';
import { type RoleContext } from 'src/engine/metadata-modules/role/types/role-context.type';

export type UpdateRecordParams = {
  objectName: string;
  objectRecordId: string;
  objectRecord: ObjectRecordProperties;
  fieldsToUpdate?: string[];
  workspaceId: string;
  roleContext?: RoleContext;
};
