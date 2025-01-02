import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { WorkflowVersionVisualizer } from '@/workflow/workflow-diagram/components/WorkflowVersionVisualizer';
import { WorkflowVersionVisualizerEffect } from '@/workflow/workflow-diagram/components/WorkflowVersionVisualizerEffect';
import { isDefined } from 'twenty-ui';

export const WorkflowRunVersionVisualizer = ({
  workflowRunId,
}: {
  workflowRunId: string;
}) => {
  const workflowRun = useWorkflowRun({
    workflowRunId,
  });
  if (!isDefined(workflowRun)) {
    return null;
  }

  return (
    <>
      <WorkflowVersionVisualizerEffect
        workflowVersionId={workflowRun.workflowVersionId}
      />

      <WorkflowVersionVisualizer
        workflowVersionId={workflowRun.workflowVersionId}
      />
    </>
  );
};
