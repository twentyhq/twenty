import { type ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export type UpdateRecordParams = {
  objectName: string;
  objectRecordId: string;
  objectRecord: ObjectRecord;
  fieldsToUpdate?: string[];
  workspaceId: string;
  roleId?: string;
};
