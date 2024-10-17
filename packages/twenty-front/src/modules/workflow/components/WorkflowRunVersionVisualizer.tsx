import { WorkflowVersionVisualizer } from '@/workflow/components/WorkflowVersionVisualizer';
import { WorkflowVersionVisualizerEffect } from '@/workflow/components/WorkflowVersionVisualizerEffect';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
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
