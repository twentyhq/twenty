import { type WorkflowRunFlow } from '@/workflow/types/Workflow';
import { getPreviousSteps } from '@/workflow/workflow-steps/utils/getWorkflowPreviousSteps';
import { isDefined } from 'twenty-shared/utils';
import {
  getWorkflowRunContext,
  TRIGGER_STEP_ID,
  type WorkflowRunStepInfos,
} from 'twenty-shared/workflow';

export const getWorkflowRunStepContext = ({
  stepId,
  flow,
  stepInfos,
}: {
  stepId: string;
  stepInfos: WorkflowRunStepInfos;
  flow: WorkflowRunFlow;
}) => {
  if (stepId === TRIGGER_STEP_ID) {
    return [];
  }

  const currentStep = flow.steps.find((step) => step.id === stepId);

  if (!isDefined(currentStep)) {
    return [];
  }

  const previousSteps = getPreviousSteps({
    steps: flow.steps,
    currentStep,
  });

  const context = getWorkflowRunContext(stepInfos);

  const previousStepsContext = previousSteps.map((step) => {
    return {
      id: step.id,
      name: step.name,
      context: context[step.id],
    };
  });

  return [
    {
      id: TRIGGER_STEP_ID,
      name: flow.trigger.name ?? 'Trigger',
      context: context[TRIGGER_STEP_ID],
    },
    ...previousStepsContext,
  ];
};
