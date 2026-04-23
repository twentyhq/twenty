import {
  type OutputSchemaV2,
  type StepOutputSchemaV2,
} from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { isBaseOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isBaseOutputSchemaV2';
import { isRecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isRecordOutputSchemaV2';

export const getCurrentSubStepFromPath = (
  step: StepOutputSchemaV2,
  path: string[],
): OutputSchemaV2 => {
  let currentSubStep = step.outputSchema;

  for (const key of path) {
    if (isRecordOutputSchemaV2(currentSubStep)) {
      currentSubStep = currentSubStep.fields[key]?.value;
    } else if (isBaseOutputSchemaV2(currentSubStep)) {
      currentSubStep = currentSubStep[key]?.value;
    }
  }

  return currentSubStep;
};
