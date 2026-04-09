import {
  type WorkflowAction,
  WorkflowActionType,
  type WorkflowDraftEmailAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowDraftEmailAction = (
  action: WorkflowAction,
): action is WorkflowDraftEmailAction => {
  return action.type === WorkflowActionType.DRAFT_EMAIL;
};
