import { type ObjectRecord } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';

export type UpdateRecordParams = {
  objectName: string;
  objectRecordId: string;
  objectRecord: ObjectRecord;
  fieldsToUpdate?: string[];
  workspaceId: string;
  roleId?: string;
};
