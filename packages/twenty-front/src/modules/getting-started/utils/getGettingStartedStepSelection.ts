import { type GettingStartedStep } from '~/generated-metadata/graphql';

export const getGettingStartedStepSelection = ({
  steps,
  completedSteps,
  selectedStep,
}: {
  steps: GettingStartedStep[];
  completedSteps: GettingStartedStep[];
  selectedStep: GettingStartedStep | null | undefined;
}): {
  selectedStep: GettingStartedStep;
  nextStep: GettingStartedStep;
  stepAfterSkip: GettingStartedStep;
} => {
  const currentStep =
    steps.find((step) => !completedSteps.includes(step)) ?? steps[0];
  const displayedStep = selectedStep ?? currentStep;
  const displayedStepIndex = steps.indexOf(displayedStep);
  const nextStep =
    [
      ...steps.slice(displayedStepIndex + 1),
      ...steps.slice(0, displayedStepIndex),
    ].find((step) => !completedSteps.includes(step)) ?? displayedStep;

  return {
    selectedStep: displayedStep,
    nextStep,
    stepAfterSkip: completedSteps.includes(displayedStep)
      ? currentStep
      : nextStep,
  };
};
