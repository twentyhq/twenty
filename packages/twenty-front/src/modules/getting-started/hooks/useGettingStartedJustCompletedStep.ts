import { getGettingStartedStepSelection } from '@/getting-started/utils/getGettingStartedStepSelection';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import {
  type GettingStartedProgressQuery,
  type GettingStartedStep,
} from '~/generated-metadata/graphql';

export const useGettingStartedJustCompletedStep = ({
  progress,
}: {
  progress: GettingStartedProgressQuery['gettingStartedProgress'] | undefined;
}) => {
  const [seenProgress, setSeenProgress] = useState(progress);
  const [justCompletedStep, setJustCompletedStep] =
    useState<GettingStartedStep | null>(null);

  if (isDefined(progress) && progress !== seenProgress) {
    if (isDefined(seenProgress)) {
      const { selectedStep: previouslyDisplayedStep } =
        getGettingStartedStepSelection({
          steps: seenProgress.steps,
          completedSteps: seenProgress.completedSteps,
          selectedStep: seenProgress.selectedStep,
        });

      if (
        !seenProgress.completedSteps.includes(previouslyDisplayedStep) &&
        progress.completedSteps.includes(previouslyDisplayedStep)
      ) {
        setJustCompletedStep(previouslyDisplayedStep);
      }
    }

    setSeenProgress(progress);
  }

  const clearJustCompletedStep = () => setJustCompletedStep(null);

  return { justCompletedStep, clearJustCompletedStep };
};
