import { type ObjectRecord } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';

export type CreateRecordParams = {
  objectName: string;
  objectRecord: ObjectRecord;
  workspaceId: string;
  roleId?: string;
};
