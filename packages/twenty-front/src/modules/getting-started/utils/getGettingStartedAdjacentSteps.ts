import {
  type GettingStartedStepActionKey,
  type GettingStartedStepDefinition,
} from '~/generated-metadata/graphql';

export const getGettingStartedAdjacentSteps = ({
  steps,
  selectedStepActionKey,
}: {
  steps: GettingStartedStepDefinition[];
  selectedStepActionKey: GettingStartedStepActionKey;
}): {
  previousStepActionKey: GettingStartedStepActionKey | undefined;
  nextStepActionKey: GettingStartedStepActionKey | undefined;
} => {
  const stepActionKeys = steps.map(({ actionKey }) => actionKey);
  const selectedStepIndex = stepActionKeys.indexOf(selectedStepActionKey);
  const otherStepsNextFirst = [
    ...stepActionKeys.slice(selectedStepIndex + 1),
    ...stepActionKeys.slice(0, selectedStepIndex),
  ];

  return {
    previousStepActionKey: otherStepsNextFirst.at(-1),
    nextStepActionKey: otherStepsNextFirst[0],
  };
};
