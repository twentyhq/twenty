import { WorkflowRunRunContext } from '@/workflow/types/Workflow';
import { WorkflowDiagramRunStatus } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const getWorkflowRunStepExecutionStatusFromContext = ({
  workflowRunRunContext,
  stepId,
}: {
  workflowRunRunContext: WorkflowRunRunContext;
  stepId: string;
}): WorkflowDiagramRunStatus => {
  const stepStatus = workflowRunRunContext.stepInfos[stepId].status;

  return stepStatus === 'RUNNING' || stepStatus === 'PENDING'
    ? 'running'
    : stepStatus === 'SUCCESS'
      ? 'success'
      : stepStatus === 'FAILED'
        ? 'failure'
        : 'not-executed';
};
