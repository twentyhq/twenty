import { WorkflowActionType } from 'twenty-shared/workflow';

export const WORKFLOW_STEP_TYPES_WITH_CURRENCY_CODE = [
  WorkflowActionType.FIND_RECORDS,
  WorkflowActionType.FILTER,
  WorkflowActionType.IF_ELSE,
  WorkflowActionType.CREATE_RECORD,
  WorkflowActionType.UPDATE_RECORD,
  WorkflowActionType.UPSERT_RECORD,
];
