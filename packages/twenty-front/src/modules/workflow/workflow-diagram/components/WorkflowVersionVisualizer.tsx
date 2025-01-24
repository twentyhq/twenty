import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { WorkflowDiagramCanvasReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasReadonly';
import '@xyflow/react/dist/style.css';
import { isDefined } from 'twenty-ui';

export const WorkflowVersionVisualizer = ({
  workflowVersionId,
}: {
  workflowVersionId: string;
}) => {
  const workflowVersion = useWorkflowVersion(workflowVersionId);

  return isDefined(workflowVersion) ? (
    <WorkflowDiagramCanvasReadonly workflowVersion={workflowVersion} />
  ) : null;
};
