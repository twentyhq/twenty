import { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { WorkflowDiagramNodeVariant } from '@/workflow/workflow-diagram/types/WorkflowDiagramNodeVariant';

export const getNodeVariantFromStepRunStatus = (
  runStatus: WorkflowRunStepStatus | undefined,
): WorkflowDiagramNodeVariant => {
  switch (runStatus) {
    case 'SUCCESS':
    case 'STOPPED':
      return 'success';
    case 'FAILED':
      return 'failure';
    case 'RUNNING':
    case 'PENDING':
      return 'running';
    case 'NOT_STARTED':
      return 'not-executed';
    default:
      return 'default';
  }
};
