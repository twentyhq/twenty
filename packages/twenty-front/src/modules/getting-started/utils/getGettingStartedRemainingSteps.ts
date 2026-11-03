import {
  type GettingStartedStepActionKey,
  type GettingStartedStepDefinition,
} from '~/generated-metadata/graphql';

export const getGettingStartedRemainingSteps = ({
  steps,
  completedStepActionKeys,
}: {
  steps: GettingStartedStepDefinition[];
  completedStepActionKeys: GettingStartedStepActionKey[];
}): GettingStartedStepDefinition[] =>
  steps.filter(({ actionKey }) => !completedStepActionKeys.includes(actionKey));
