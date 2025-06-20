import { WorkflowDiagramRunStatus } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const getShouldFocusNodeTab = ({
  stepExecutionStatus,
  isFormNode,
}: {
  stepExecutionStatus: WorkflowDiagramRunStatus;
  isFormNode: boolean;
}) => {
  return isFormNode && stepExecutionStatus === 'running';
};
