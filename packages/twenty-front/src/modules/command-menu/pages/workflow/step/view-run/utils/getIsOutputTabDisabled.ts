import { WorkflowDiagramRunStatus } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const getIsOutputTabDisabled = ({
  stepExecutionStatus,
}: {
  stepExecutionStatus: WorkflowDiagramRunStatus;
}) => {
  return (
    stepExecutionStatus === 'running' || stepExecutionStatus === 'not-executed'
  );
};
