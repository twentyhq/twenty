import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { CREATE_RECORD_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/CreateRecordAction';
import { DELETE_RECORD_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/DeleteRecordAction';
import { FIND_RECORDS_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/FindRecordsAction';
import { UPDATE_RECORD_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/UpdateRecordAction';
import { UPSERT_RECORD_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/UpsertRecordAction';

export const RECORD_ACTIONS: Array<{
  defaultLabel: string;
  type: Extract<
    WorkflowActionType,
    | 'CREATE_RECORD'
    | 'UPDATE_RECORD'
    | 'DELETE_RECORD'
    | 'UPSERT_RECORD'
    | 'FIND_RECORDS'
  >;
  icon: string;
}> = [
  CREATE_RECORD_ACTION,
  UPDATE_RECORD_ACTION,
  DELETE_RECORD_ACTION,
  FIND_RECORDS_ACTION,
  UPSERT_RECORD_ACTION,
];
