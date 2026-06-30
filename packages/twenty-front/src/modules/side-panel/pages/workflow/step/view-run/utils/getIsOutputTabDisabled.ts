import { type WorkflowRunStepStatus } from '@/workflow/types/Workflow';

export const getIsOutputTabDisabled = ({
  stepExecutionStatus,
}: {
  stepExecutionStatus: WorkflowRunStepStatus;
}) => {
  return (
    stepExecutionStatus === 'RUNNING' ||
    stepExecutionStatus === 'NOT_STARTED' ||
    stepExecutionStatus === 'SKIPPED'
  );
};
