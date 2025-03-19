import { WorkflowStep } from '@/workflow/types/Workflow';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';

export const getWorkflowPreviousStepId = ({
  stepId,
  steps,
}: {
  stepId: string;
  steps: Array<WorkflowStep>;
}) => {
  if (stepId === TRIGGER_STEP_ID) {
    return undefined;
  }

  if (stepId === steps[0].id) {
    return TRIGGER_STEP_ID;
  }

  const stepIndex = steps.findIndex((step) => step.id === stepId);
  if (stepIndex === -1) {
    throw new Error('Step not found');
  }

  return steps[stepIndex - 1].id;
};
