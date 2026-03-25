import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { WorkflowDiagramCanvasReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasReadonly';
import '@xyflow/react/dist/style.css';
import { isDefined } from 'twenty-shared/utils';

export const WorkflowVersionVisualizer = ({
  workflowVersionId,
}: {
  workflowVersionId: string;
}) => {
  const workflowVersion = useWorkflowVersion(workflowVersionId);

  if (!isDefined(workflowVersion)) {
    return null;
  }

  return (
    <WorkflowDiagramCanvasReadonly versionStatus={workflowVersion.status} />
  );
};
