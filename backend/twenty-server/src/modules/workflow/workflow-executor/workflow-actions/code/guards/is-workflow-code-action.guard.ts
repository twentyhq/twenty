import {
  type WorkflowAction,
  WorkflowActionType,
  type WorkflowCodeAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowCodeAction = (
  action: WorkflowAction,
): action is WorkflowCodeAction => {
  return action.type === WorkflowActionType.CODE;
};
