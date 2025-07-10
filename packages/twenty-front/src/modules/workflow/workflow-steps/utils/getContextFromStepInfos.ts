import { WorkflowRunStateStepsInfos } from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

export const getContextFromStepInfos = (
  stepInfos: WorkflowRunStateStepsInfos,
) => {
  return Object.fromEntries(
    Object.entries(stepInfos)
      .filter(([, value]) => isDefined(value?.['result']))
      .map(([key, value]) => [key, value?.['result']]),
  );
};
