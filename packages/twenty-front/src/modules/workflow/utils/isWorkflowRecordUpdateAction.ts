import {
  WorkflowAction,
  WorkflowRecordUpdateAction,
} from '@/workflow/types/Workflow';

export const isWorkflowRecordUpdateAction = (
  action: WorkflowAction,
): action is WorkflowRecordUpdateAction => {
  return (
    action.type === 'RECORD_CRUD' && action.settings.input.type === 'UPDATE'
  );
};
