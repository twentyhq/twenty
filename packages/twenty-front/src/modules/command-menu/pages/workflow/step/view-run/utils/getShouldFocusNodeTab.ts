import { WorkflowActionType } from '@/workflow/types/Workflow';
import { WorkflowDiagramRunStatus } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const getShouldFocusNodeTab = ({
  stepExecutionStatus,
  actionType,
}: {
  stepExecutionStatus: WorkflowDiagramRunStatus;
  actionType: WorkflowActionType | undefined;
}) => {
  return actionType === 'FORM' && stepExecutionStatus === 'running';
};
