import { type WorkflowStep } from '@/workflow/types/Workflow';
import { type WorkflowRunStepInfo } from 'twenty-shared/workflow';
import { getIsDescendantOfIterator } from './getIsDescendantOfIterator';
import { getWorkflowRunAllStepInfoHistory } from './getWorkflowRunAllStepInfoHistory';

export const getStepInfoHistoryItem = ({
  stepInfo,
  steps,
  stepId,
  iterationIndex,
}: {
  stepInfo: WorkflowRunStepInfo;
  steps: WorkflowStep[];
  stepId: string;
  iterationIndex: number;
}) => {
  const allStepInfoHistory = getWorkflowRunAllStepInfoHistory({ stepInfo });

  const isDescendantOfIterator = getIsDescendantOfIterator({ steps, stepId });

  if (isDescendantOfIterator) {
    return allStepInfoHistory[iterationIndex];
  }

  return allStepInfoHistory.at(-1);
};
