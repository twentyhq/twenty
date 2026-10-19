import { GETTING_STARTED_STEPS } from '@/getting-started/constants/GettingStartedSteps';
import { type GettingStartedStep } from '~/generated-metadata/graphql';

export const getNextGettingStartedStep = ({
  selectedStep,
  completedSteps,
}: {
  selectedStep: GettingStartedStep;
  completedSteps: GettingStartedStep[];
}): GettingStartedStep => {
  const selectedStepIndex = GETTING_STARTED_STEPS.indexOf(selectedStep);
  const stepsAfterSelectedStep = [
    ...GETTING_STARTED_STEPS.slice(selectedStepIndex + 1),
    ...GETTING_STARTED_STEPS.slice(0, selectedStepIndex + 1),
  ];

  return (
    stepsAfterSelectedStep.find((step) => !completedSteps.includes(step)) ??
    selectedStep
  );
};
