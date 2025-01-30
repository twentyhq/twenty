import {
  OutputSchema,
  StepOutputSchema,
} from '@/workflow/workflow-variables/types/StepOutputSchema';
import { isBaseOutputSchema } from '@/workflow/workflow-variables/utils/isBaseOutputSchema';
import { isRecordOutputSchema } from '@/workflow/workflow-variables/utils/isRecordOutputSchema';

export const getCurrentSubStepFromPath = (
  step: StepOutputSchema,
  path: string[],
): OutputSchema => {
  let currentSubStep = step.outputSchema;

  for (const key of path) {
    if (isRecordOutputSchema(currentSubStep)) {
      currentSubStep = currentSubStep.fields[key]?.value;
    } else if (isBaseOutputSchema(currentSubStep)) {
      currentSubStep = currentSubStep[key]?.value;
    }
  }

  return currentSubStep;
};
