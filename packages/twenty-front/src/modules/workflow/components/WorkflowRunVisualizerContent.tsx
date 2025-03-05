import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { WorkflowRun } from '@/workflow/types/Workflow';
import { WorkflowRunDiagramCanvas } from '@/workflow/workflow-diagram/components/WorkflowRunDiagramCanvas';
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

      <WorkflowRunDiagramCanvas versionStatus={workflowVersion.status} />
    </>
  );
};
