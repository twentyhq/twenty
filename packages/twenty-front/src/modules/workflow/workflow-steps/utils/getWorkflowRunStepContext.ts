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
  const stepContext: Array<{ id: string; name: string; context: any }> = [];

  if (stepId === TRIGGER_STEP_ID) {
    return stepContext;
  }

  stepContext.push({
    id: TRIGGER_STEP_ID,
    name: flow.trigger.name ?? 'Trigger',
    context: context[TRIGGER_STEP_ID],
  });

  for (const step of flow.steps) {
    if (step.id === stepId) {
      break;
    }

    stepContext.push({
      id: step.id,
      name: step.name,
      context: context[step.id],
    });
  }

  return stepContext;
};
