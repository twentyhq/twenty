import { type GettingStartedStepActionKey } from '~/generated-metadata/graphql';

export const getGettingStartedStepSelection = ({
  stepActionKeys,
  completedStepActionKeys,
  selectedStepActionKey,
}: {
  stepActionKeys: GettingStartedStepActionKey[];
  completedStepActionKeys: GettingStartedStepActionKey[];
  selectedStepActionKey: GettingStartedStepActionKey | null | undefined;
}): {
  selectedStepActionKey: GettingStartedStepActionKey;
  nextStep: GettingStartedStepActionKey;
  stepAfterSkip: GettingStartedStepActionKey;
} => {
  const currentStep =
    stepActionKeys.find(
      (stepActionKey) => !completedStepActionKeys.includes(stepActionKey),
    ) ?? stepActionKeys[0];
  const displayedStep = selectedStepActionKey ?? currentStep;
  const displayedStepIndex = stepActionKeys.indexOf(displayedStep);
  const nextStep =
    [
      ...stepActionKeys.slice(displayedStepIndex + 1),
      ...stepActionKeys.slice(0, displayedStepIndex),
    ].find(
      (stepActionKey) => !completedStepActionKeys.includes(stepActionKey),
    ) ?? displayedStep;

  return {
    selectedStepActionKey: displayedStep,
    nextStep,
    stepAfterSkip: completedStepActionKeys.includes(displayedStep)
      ? currentStep
      : nextStep,
  };
};
