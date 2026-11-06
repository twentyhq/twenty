import { isPlainObject } from 'twenty-shared/utils';

export type ClearedIfElseNextStepIds = {
  stepId: unknown;
  nextStepIds: unknown[];
};

// Runs only ever followed an If/Else's branches, so clearing these keeps every run as it was
export const clearIfElseNextStepIds = (
  steps: unknown,
): {
  steps: unknown;
  hasChanged: boolean;
  clearedNextStepIds: ClearedIfElseNextStepIds[];
} => {
  if (!Array.isArray(steps)) {
    return { steps, hasChanged: false, clearedNextStepIds: [] };
  }

  const clearedNextStepIds: ClearedIfElseNextStepIds[] = [];

  const updatedSteps = steps.map((step) => {
    if (
      !isPlainObject(step) ||
      step.type !== 'IF_ELSE' ||
      !Array.isArray(step.nextStepIds) ||
      step.nextStepIds.length === 0
    ) {
      return step;
    }

    clearedNextStepIds.push({ stepId: step.id, nextStepIds: step.nextStepIds });

    return { ...step, nextStepIds: [] };
  });

  const hasChanged = clearedNextStepIds.length > 0;

  return {
    steps: hasChanged ? updatedSteps : steps,
    hasChanged,
    clearedNextStepIds,
  };
};
