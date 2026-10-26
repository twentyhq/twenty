import { type GettingStartedStep } from '~/generated-metadata/graphql';

export const getNextGettingStartedStep = ({
  steps,
  selectedStep,
  completedSteps,
}: {
  steps: GettingStartedStep[];
  selectedStep: GettingStartedStep;
  completedSteps: GettingStartedStep[];
}): GettingStartedStep => {
  const selectedStepIndex = steps.indexOf(selectedStep);
  const stepsAfterSelectedStep = [
    ...steps.slice(selectedStepIndex + 1),
    ...steps.slice(0, selectedStepIndex + 1),
  ];

  return (
    stepsAfterSelectedStep.find((step) => !completedSteps.includes(step)) ??
    selectedStep
  );
};
