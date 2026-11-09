import { getGettingStartedStackedSteps } from '@/getting-started/utils/getGettingStartedStackedSteps';

import {
  type GettingStartedStepActionKey,
  type GettingStartedStepDefinition,
} from '~/generated-metadata/graphql';

export const getGettingStartedAdjacentSteps = ({
  steps,
  completedStepActionKeys,
  selectedStepActionKey,
}: {
  steps: GettingStartedStepDefinition[];
  completedStepActionKeys: GettingStartedStepActionKey[];
  selectedStepActionKey: GettingStartedStepActionKey;
}): {
  previousStepActionKey: GettingStartedStepActionKey | undefined;
  nextStepActionKey: GettingStartedStepActionKey | undefined;
} => {
  const stepActionKeys = steps.map(({ actionKey }) => actionKey);
  const selectedStepIndex = stepActionKeys.indexOf(selectedStepActionKey);
  const otherStepsPreviousFirst = [
    ...stepActionKeys.slice(0, selectedStepIndex).reverse(),
    ...stepActionKeys.slice(selectedStepIndex + 1).reverse(),
  ];
  const isRemaining = (stepActionKey: GettingStartedStepActionKey) =>
    !completedStepActionKeys.includes(stepActionKey);

  const previousStepActionKey =
    (isRemaining(selectedStepActionKey)
      ? otherStepsPreviousFirst.find(isRemaining)
      : undefined) ?? otherStepsPreviousFirst[0];
  const [frontStackedStep] = getGettingStartedStackedSteps({
    steps,
    completedStepActionKeys,
    selectedStepActionKey,
  });

  return {
    previousStepActionKey,
    nextStepActionKey: frontStackedStep?.actionKey,
  };
};
