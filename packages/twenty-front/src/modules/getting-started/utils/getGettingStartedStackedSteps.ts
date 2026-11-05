import { GETTING_STARTED_STACKED_STEP_MAX_COUNT } from '@/getting-started/constants/GettingStartedStackedStepMaxCount';
import { getGettingStartedStepSelection } from '@/getting-started/utils/getGettingStartedStepSelection';

import {
  type GettingStartedStepActionKey,
  type GettingStartedStepDefinition,
} from '~/generated-metadata/graphql';

export const getGettingStartedStackedSteps = ({
  steps,
  completedStepActionKeys,
  selectedStepActionKey,
}: {
  steps: GettingStartedStepDefinition[];
  completedStepActionKeys: GettingStartedStepActionKey[];
  selectedStepActionKey: GettingStartedStepActionKey;
}): GettingStartedStepDefinition[] => {
  const { stepAfterSkip } = getGettingStartedStepSelection({
    stepActionKeys: steps.map(({ actionKey }) => actionKey),
    completedStepActionKeys,
    selectedStepActionKey,
  });
  const stepAfterSkipIndex = steps.findIndex(
    ({ actionKey }) => actionKey === stepAfterSkip,
  );
  const otherSteps = [
    ...steps.slice(stepAfterSkipIndex),
    ...steps.slice(0, stepAfterSkipIndex),
  ].filter(({ actionKey }) => actionKey !== selectedStepActionKey);
  const isCompleted = ({ actionKey }: GettingStartedStepDefinition) =>
    completedStepActionKeys.includes(actionKey);

  return [
    ...otherSteps.filter((step) => !isCompleted(step)),
    ...otherSteps.filter(isCompleted),
  ].slice(0, GETTING_STARTED_STACKED_STEP_MAX_COUNT);
};
