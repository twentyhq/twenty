import { isArray } from '@sniptt/guards';
import { StepStatus, type WorkflowRunStepInfo } from 'twenty-shared/workflow';

// History holds one entry per iteration, so retried attempts are dropped: they
// are the only entries archived with a FAILED status, since a step that fails
// without retrying ends the run before the iterator archives anything.
export const getWorkflowRunAllStepInfoHistory = ({
  stepInfo,
}: {
  stepInfo: WorkflowRunStepInfo;
}) => {
  const iterationHistory = isArray(stepInfo?.history)
    ? stepInfo.history.filter((entry) => entry.status !== StepStatus.FAILED)
    : [];

  const allStepInfoHistory: WorkflowRunStepInfo[] = [
    ...iterationHistory,
    stepInfo,
  ];

  return allStepInfoHistory;
};
