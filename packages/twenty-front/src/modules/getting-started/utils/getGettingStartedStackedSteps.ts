import { GETTING_STARTED_STACKED_STEP_MAX_COUNT } from '@/getting-started/constants/GettingStartedStackedStepMaxCount';

import {
  type GettingStartedStepActionKey,
  type GettingStartedStepDefinition,
} from '~/generated-metadata/graphql';

export const getGettingStartedStackedSteps = ({
  steps,
  selectedStepActionKey,
}: {
  steps: GettingStartedStepDefinition[];
  selectedStepActionKey: GettingStartedStepActionKey;
}): GettingStartedStepDefinition[] => {
  const selectedStepIndex = steps.findIndex(
    ({ actionKey }) => actionKey === selectedStepActionKey,
  );

  return [
    ...steps.slice(selectedStepIndex + 1),
    ...steps.slice(0, selectedStepIndex),
  ].slice(0, GETTING_STARTED_STACKED_STEP_MAX_COUNT);
};
