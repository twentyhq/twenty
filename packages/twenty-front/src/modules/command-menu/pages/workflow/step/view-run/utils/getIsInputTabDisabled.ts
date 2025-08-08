import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { WorkflowRunStepStatus } from '@/workflow/types/Workflow';

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
