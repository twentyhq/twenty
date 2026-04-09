import {
  type WorkflowAction,
  WorkflowActionType,
  type WorkflowHttpRequestAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowHttpRequestAction = (
  action: WorkflowAction,
): action is WorkflowHttpRequestAction => {
  return action.type === WorkflowActionType.HTTP_REQUEST;
};
