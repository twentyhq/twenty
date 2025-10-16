import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { getWorkflowRunAllStepInfoHistory } from '@/workflow/workflow-steps/utils/getWorkflowRunAllStepInfoHistory';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfo } from 'twenty-shared/workflow';
export const getNodeIterationCount = ({
  stepInfo,
  actionType,
}: {
  stepInfo: WorkflowRunStepInfo;
  actionType: WorkflowActionType;
}) => {
  const stepInfoHistory = getWorkflowRunAllStepInfoHistory({ stepInfo });

  if (isDefined(actionType) && actionType === 'ITERATOR') {
    return stepInfoHistory.filter(
      (stepInfo) =>
        stepInfo.status === StepStatus.SUCCESS ||
        stepInfo.status === StepStatus.RUNNING,
    ).length;
  }

  return stepInfoHistory.filter(
    (stepInfo) =>
      stepInfo.status === StepStatus.SUCCESS ||
      stepInfo.status === StepStatus.STOPPED,
  ).length;
};
