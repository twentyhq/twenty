import { isBaseOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isBaseOutputSchemaV2';
import { isRecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isRecordOutputSchemaV2';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { getCurrentSubStepFromPath } from '@/workflow/workflow-variables/utils/getCurrentSubStepFromPath';
import { isDefined } from 'twenty-shared/utils';

export const getStepHeaderLabel = (
  step: StepOutputSchemaV2,
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
    isRecordOutputSchemaV2(previousSubStep) &&
    isDefined(previousSubStep.fields[subStepName]?.label)
  ) {
    return previousSubStep.fields[subStepName].label;
  }

  if (
    isBaseOutputSchemaV2(previousSubStep) &&
    isDefined(previousSubStep[subStepName]?.label)
  ) {
    return previousSubStep[subStepName].label;
  }

  return subStepName;
};
