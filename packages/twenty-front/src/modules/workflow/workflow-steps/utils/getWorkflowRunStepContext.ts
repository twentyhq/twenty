import {
  WorkflowRunFlow,
  WorkflowRunStateStepsInfos,
} from '@/workflow/types/Workflow';
import { getPreviousSteps } from '@/workflow/workflow-steps/utils/getWorkflowPreviousSteps';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { getContextFromStepInfos } from '@/workflow/workflow-steps/utils/getContextFromStepInfos';

export const getWorkflowRunStepContext = ({
  stepId,
  flow,
  stepsInfos,
}: {
  stepId: string;
  stepsInfos: WorkflowRunStateStepsInfos;
  flow: WorkflowRunFlow;
}) => {
  if (stepId === TRIGGER_STEP_ID) {
    return [];
  }

  const previousSteps = getPreviousSteps(flow.steps, stepId);

  const context = getContextFromStepInfos(stepsInfos);

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
