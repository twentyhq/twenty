import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { WorkflowRun } from '@/workflow/types/Workflow';
import { WorkflowDiagramCanvasReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasReadonly';
import { WorkflowRunVisualizerEffect } from '@/workflow/workflow-diagram/components/WorkflowRunVisualizerEffect';
import { isDefined } from 'twenty-shared';

export const WorkflowRunVisualizerContent = ({
  workflowRun,
}: {
  workflowRun: WorkflowRun;
}) => {
  const workflowVersion = useWorkflowVersion(workflowRun.workflowVersionId);
  if (!isDefined(workflowVersion)) {
    return null;
  }

  return (
    <>
      <WorkflowRunVisualizerEffect workflowRun={workflowRun} />

      <WorkflowDiagramCanvasReadonly versionStatus={workflowVersion.status} />
    </>
  );
};
