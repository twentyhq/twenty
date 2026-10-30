import { getGettingStartedJustCompletedStep } from '@/getting-started/utils/getGettingStartedJustCompletedStep';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import {
  type GettingStartedProgressQuery,
  type GettingStartedStepActionKey,
} from '~/generated-metadata/graphql';

export const useGettingStartedJustCompletedStep = ({
  progress,
}: {
  progress: GettingStartedProgressQuery['gettingStartedProgress'] | undefined;
}) => {
  const [seenProgress, setSeenProgress] = useState(progress);
  const [justCompletedStep, setJustCompletedStep] =
    useState<GettingStartedStepActionKey | null>(null);

  if (isDefined(progress) && progress !== seenProgress) {
    const newlyCompletedStep = getGettingStartedJustCompletedStep({
      previousProgress: seenProgress,
      progress,
    });

    if (isDefined(newlyCompletedStep)) {
      setJustCompletedStep(newlyCompletedStep);
    }

    setSeenProgress(progress);
  }

  const clearJustCompletedStep = () => setJustCompletedStep(null);

  return { justCompletedStep, clearJustCompletedStep };
};
