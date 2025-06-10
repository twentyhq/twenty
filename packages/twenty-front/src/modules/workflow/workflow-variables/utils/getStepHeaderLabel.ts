import { StepOutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';
import { getCurrentSubStepFromPath } from '@/workflow/workflow-variables/utils/getCurrentSubStepFromPath';
import { isBaseOutputSchema } from '@/workflow/workflow-variables/utils/isBaseOutputSchema';
import { isRecordOutputSchema } from '@/workflow/workflow-variables/utils/isRecordOutputSchema';
import { isDefined } from 'twenty-shared/utils';

export const getStepHeaderLabel = (
  step: StepOutputSchema,
  currentPath: string[],
) => {
  if (currentPath.length === 0) {
    return step.name;
  }

  const subStepName = currentPath.at(-1);
  const previousSubStep = getCurrentSubStepFromPath(
    step,
    currentPath.slice(0, -1),
  );

  if (!subStepName) {
    return step.name;
  }

  if (
    isRecordOutputSchema(previousSubStep) &&
    isDefined(previousSubStep.fields[subStepName]?.label)
  ) {
    return previousSubStep.fields[subStepName].label;
  }

  if (
    isBaseOutputSchema(previousSubStep) &&
    isDefined(previousSubStep[subStepName]?.label)
  ) {
    return previousSubStep[subStepName].label;
  }

  return subStepName;
};
