import {
  type WorkflowActionType,
  type WorkflowRunStepStatus,
} from '@/workflow/types/Workflow';

export const getShouldFocusNodeTab = ({
  stepExecutionStatus,
  actionType,
}: {
  stepExecutionStatus: WorkflowRunStepStatus;
  actionType: WorkflowActionType | undefined;
}) => {
  // A form waits for its fields; an AI agent step waits for an answer in
  // its conversation. Both are what the node tab shows.
  return (
    (actionType === 'FORM' || actionType === 'AI_AGENT') &&
    stepExecutionStatus === 'PENDING'
  );
};
