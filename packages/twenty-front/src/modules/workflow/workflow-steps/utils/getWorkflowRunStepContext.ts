import { type WorkflowRunFlow } from '@/workflow/types/Workflow';
import { getWorkflowStepDisplayName } from '@/workflow/utils/getWorkflowStepDisplayName';
import {
  TRIGGER_STEP_ID,
  type WorkflowRunStepInfos,
} from 'twenty-shared/workflow';
import { type WorkflowRunStepContext } from '@/workflow/workflow-steps/types/WorkflowRunStepContext';
import { getPreviousSteps } from '@/workflow/workflow-steps/utils/getWorkflowPreviousSteps';
import { getWorkflowRunAllStepInfoHistory } from '@/workflow/workflow-steps/utils/getWorkflowRunAllStepInfoHistory';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const getWorkflowRunStepContext = ({
  stepId,
  flow,
  stepInfos,
  currentLoopIterationIndex,
}: {
  stepId: string;
  stepInfos: WorkflowRunStepInfos;
  flow: WorkflowRunFlow;
  currentLoopIterationIndex: number | undefined;
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

  const reversedPreviousSteps = previousSteps.toReversed();

  const reversedPreviousStepsContext: WorkflowRunStepContext[] = [];

  let isInLoop = isDefined(currentLoopIterationIndex);

  for (const step of reversedPreviousSteps) {
    const stepInfoHistory = getWorkflowRunAllStepInfoHistory({
      stepInfo: stepInfos[step.id],
    });

    const historyItemIndex =
      isDefined(currentLoopIterationIndex) && isInLoop
        ? currentLoopIterationIndex
        : 0;

    reversedPreviousStepsContext.push({
      id: step.id,
      name: getWorkflowStepDisplayName({ name: step.name, type: step.type }),
      context: stepInfoHistory[historyItemIndex].result,
    });

    if (step.type === 'ITERATOR') {
      isInLoop = false;
    }
  }

  return [
    {
      id: TRIGGER_STEP_ID,
      name: isDefined(flow.trigger.name)
        ? getWorkflowStepDisplayName({
            name: flow.trigger.name,
            type: flow.trigger.type,
          })
        : t`Trigger`,
      context: stepInfos[TRIGGER_STEP_ID].result,
    },
    ...reversedPreviousStepsContext.toReversed(),
  ];
};
