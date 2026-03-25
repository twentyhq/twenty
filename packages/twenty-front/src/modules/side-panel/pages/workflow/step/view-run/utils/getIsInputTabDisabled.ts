import { type WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

export const getIsInputTabDisabled = ({
  stepExecutionStatus,
  workflowSelectedNode,
}: {
  workflowSelectedNode: string;
  stepExecutionStatus: WorkflowRunStepStatus;
}) => {
  return (
    workflowSelectedNode === TRIGGER_STEP_ID ||
    stepExecutionStatus === 'NOT_STARTED'
  );
};
