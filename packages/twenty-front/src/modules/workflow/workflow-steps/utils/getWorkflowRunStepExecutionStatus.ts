import { WorkflowRunOutput } from '@/workflow/types/Workflow';
import { WorkflowDiagramRunStatus } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { isNull } from '@sniptt/guards';
import { isDefined } from 'twenty-shared';

export const getWorkflowRunStepExecutionStatus = ({
  workflowRunOutput,
  stepId,
}: {
  workflowRunOutput: WorkflowRunOutput | null;
  stepId: string;
}): WorkflowDiagramRunStatus => {
  if (isNull(workflowRunOutput)) {
    return 'not-executed';
  }

  const stepOutput = workflowRunOutput.stepsOutput?.[stepId];

  if (isDefined(stepOutput?.error)) {
    return 'failure';
  }

  if (isDefined(stepOutput?.pendingEvent)) {
    return 'running';
  }

  if (isDefined(stepOutput?.result)) {
    return 'success';
  }

  return 'not-executed';
};
