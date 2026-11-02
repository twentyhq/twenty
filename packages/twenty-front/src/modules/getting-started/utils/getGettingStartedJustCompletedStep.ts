import { getGettingStartedStepSelection } from '@/getting-started/utils/getGettingStartedStepSelection';
import { isDefined } from 'twenty-shared/utils';

import {
  type GettingStartedProgressQuery,
  type GettingStartedStepActionKey,
} from '~/generated-metadata/graphql';

type GettingStartedProgress =
  GettingStartedProgressQuery['gettingStartedProgress'];

export const getGettingStartedJustCompletedStep = ({
  previousProgress,
  progress,
}: {
  previousProgress:
    | Pick<
        GettingStartedProgress,
        'steps' | 'completedStepActionKeys' | 'selectedStepActionKey'
      >
    | undefined;
  progress: Pick<GettingStartedProgress, 'completedStepActionKeys'>;
}): GettingStartedStepActionKey | null => {
  if (!isDefined(previousProgress)) {
    return null;
  }

  const { selectedStepActionKey: previouslyDisplayedStep } =
    getGettingStartedStepSelection({
      stepActionKeys: previousProgress.steps.map(({ actionKey }) => actionKey),
      completedStepActionKeys: previousProgress.completedStepActionKeys,
      selectedStepActionKey: previousProgress.selectedStepActionKey,
    });

  const wasDisplayedStepCompleted =
    previousProgress.completedStepActionKeys.includes(previouslyDisplayedStep);
  const isDisplayedStepCompleted = progress.completedStepActionKeys.includes(
    previouslyDisplayedStep,
  );

  return !wasDisplayedStepCompleted && isDisplayedStepCompleted
    ? previouslyDisplayedStep
    : null;
};
