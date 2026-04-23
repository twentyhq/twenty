import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const shouldExecuteChildStep = ({
  parentSteps,
  stepInfos,
}: {
  parentSteps: WorkflowAction[];
  stepInfos: WorkflowRunStepInfos;
}) => {
  if (parentSteps.length === 0) {
    return true;
  }
  const hasSuccessfulParentStep = parentSteps.some(
    (parentStep) => stepInfos[parentStep.id]?.status === StepStatus.SUCCESS,
  );

  const areAllParentsCompleted = parentSteps.every(
    (parentStep) =>
      stepInfos[parentStep.id]?.status === StepStatus.SUCCESS ||
      stepInfos[parentStep.id]?.status === StepStatus.STOPPED ||
      stepInfos[parentStep.id]?.status === StepStatus.SKIPPED,
  );

  return hasSuccessfulParentStep && areAllParentsCompleted;
};
