import { getGettingStartedStepSelection } from '@/getting-started/utils/getGettingStartedStepSelection';
import { isDefined } from 'twenty-shared/utils';

import {
  type GettingStartedProgressQuery,
  type GettingStartedStep,
} from '~/generated-metadata/graphql';

type GettingStartedProgress =
  GettingStartedProgressQuery['gettingStartedProgress'];

export const getGettingStartedJustCompletedStep = ({
  previousProgress,
  progress,
}: {
  previousProgress:
    | Pick<GettingStartedProgress, 'steps' | 'completedSteps' | 'selectedStep'>
    | undefined;
  progress: Pick<GettingStartedProgress, 'completedSteps'>;
}): GettingStartedStep | null => {
  if (!isDefined(previousProgress)) {
    return null;
  }

  const { selectedStep: previouslyDisplayedStep } =
    getGettingStartedStepSelection({
      steps: previousProgress.steps.map(({ step }) => step),
      completedSteps: previousProgress.completedSteps,
      selectedStep: previousProgress.selectedStep,
    });

  const wasDisplayedStepCompleted = previousProgress.completedSteps.includes(
    previouslyDisplayedStep,
  );
  const isDisplayedStepCompleted = progress.completedSteps.includes(
    previouslyDisplayedStep,
  );

  return !wasDisplayedStepCompleted && isDisplayedStepCompleted
    ? previouslyDisplayedStep
    : null;
};
