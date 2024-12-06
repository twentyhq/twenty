import {
  WorkflowAction,
  WorkflowRecordDeleteAction,
} from '@/workflow/types/Workflow';

export const isWorkflowRecordDeleteAction = (
  action: WorkflowAction,
): action is WorkflowRecordDeleteAction => {
  return (
    action.type === 'RECORD_CRUD' && action.settings.input.type === 'DELETE'
  );
};
