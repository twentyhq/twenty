import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { WorkflowDiagramCanvasReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasReadonly';
import { workflowDiagramState } from '@/workflow/workflow-diagram/states/workflowDiagramState';
import '@xyflow/react/dist/style.css';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const WorkflowVersionVisualizer = ({
  workflowVersionId,
}: {
  workflowVersionId: string;
}) => {
  const workflowVersion = useWorkflowVersion(workflowVersionId);

  const workflowDiagram = useRecoilValue(workflowDiagramState);

  return isDefined(workflowDiagram) && isDefined(workflowVersion) ? (
    <WorkflowDiagramCanvasReadonly
      diagram={workflowDiagram}
      workflowVersion={workflowVersion}
    />
  ) : null;
};
