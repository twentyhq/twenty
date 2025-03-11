import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { WorkflowDiagramCanvasReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasReadonly';
import { WorkflowVersionOutputSchemaEffect } from '@/workflow/workflow-diagram/components/WorkflowVersionOutputSchemaEffect';
import '@xyflow/react/dist/style.css';
import { isDefined } from 'twenty-shared';

export const WorkflowVersionVisualizer = ({
  workflowVersionId,
}: {
  workflowVersionId: string;
}) => {
  const workflowVersion = useWorkflowVersion(workflowVersionId);

  return isDefined(workflowVersion) ? (
    <>
      <WorkflowVersionOutputSchemaEffect workflowVersion={workflowVersion} />
      <WorkflowDiagramCanvasReadonly versionStatus={workflowVersion.status} />
    </>
  ) : null;
};
