import { WorkflowRunContext, WorkflowRunFlow } from '@/workflow/types/Workflow';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';

export const getWorkflowRunStepContext = ({
  stepId,
  flow,
  context,
}: {
  stepId: string;
  context: WorkflowRunContext;
  flow: WorkflowRunFlow;
}) => {
  const stepContext: Record<string, any> = {};

  if (stepId === TRIGGER_STEP_ID) {
    return stepContext;
  }

  stepContext[flow.trigger.name ?? 'Trigger'] = context[TRIGGER_STEP_ID];

  for (const step of flow.steps) {
    if (step.id === stepId) {
      break;
    }

    stepContext[step.name] = context[step.id];
  }

  return stepContext;
};
