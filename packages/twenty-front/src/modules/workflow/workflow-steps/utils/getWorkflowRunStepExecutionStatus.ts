import { WorkflowRunOutput } from '@/workflow/types/Workflow';
import { WorkflowDiagramRunStatus } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { isNull } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

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

  if (stepId === TRIGGER_STEP_ID) {
    return 'success';
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
