import {
  GETTING_STARTED_STEPS,
  type GettingStartedStep,
} from 'twenty-shared/types';

export const getNextGettingStartedStep = (
  currentStep: GettingStartedStep,
  completedSteps: readonly GettingStartedStep[],
): GettingStartedStep | null => {
  const currentIndex = GETTING_STARTED_STEPS.indexOf(currentStep);
  for (let offset = 1; offset <= GETTING_STARTED_STEPS.length; offset++) {
    const step =
      GETTING_STARTED_STEPS[
        (currentIndex + offset) % GETTING_STARTED_STEPS.length
      ];
    if (!completedSteps.includes(step)) return step;
  }
  return null;
};
