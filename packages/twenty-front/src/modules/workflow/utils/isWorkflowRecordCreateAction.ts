import {
  WorkflowAction,
  WorkflowRecordCreateAction,
} from '@/workflow/types/Workflow';

export const isWorkflowRecordCreateAction = (
  action: WorkflowAction,
): action is WorkflowRecordCreateAction => {
  return (
    action.type === 'RECORD_CRUD' && action.settings.input.type === 'CREATE'
  );
};
