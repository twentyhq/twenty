import { WorkflowRunFlow } from '@/workflow/types/Workflow';
import { getPreviousSteps } from '@/workflow/workflow-steps/utils/getWorkflowPreviousSteps';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import {
  getWorkflowRunContext,
  WorkflowRunStepInfos,
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

  const previousSteps = getPreviousSteps(flow.steps, stepId);

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
