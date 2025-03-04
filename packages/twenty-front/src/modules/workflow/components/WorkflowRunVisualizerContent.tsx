import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { WorkflowRun } from '@/workflow/types/Workflow';
import { WorkflowRunDiagramCanvas } from '@/workflow/workflow-diagram/components/WorkflowRunDiagramCanvas';
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

  return <WorkflowRunDiagramCanvas versionStatus={workflowVersion.status} />;
};
