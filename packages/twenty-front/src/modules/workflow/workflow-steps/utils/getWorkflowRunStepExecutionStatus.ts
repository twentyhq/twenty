import {
  WorkflowRunState,
  WorkflowRunStepStatus,
} from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

export const getWorkflowRunStepExecutionStatus = ({
  workflowRunState,
  stepId,
}: {
  workflowRunState: WorkflowRunState | null;
  stepId: string;
}): WorkflowRunStepStatus => {
  const stepOutput = workflowRunState?.stepInfos?.[stepId];

  if (isDefined(stepOutput)) {
    return stepOutput.status;
  }

  return 'NOT_STARTED';
};
