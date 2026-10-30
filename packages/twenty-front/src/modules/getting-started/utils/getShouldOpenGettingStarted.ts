import { getGettingStartedRemainingSteps } from '@/getting-started/utils/getGettingStartedRemainingSteps';
import { isDefined } from 'twenty-shared/utils';

import { type GettingStartedProgressQuery } from '~/generated-metadata/graphql';

export const getShouldOpenGettingStarted = ({
  progress,
  now,
}: {
  progress: Pick<
    GettingStartedProgressQuery['gettingStartedProgress'],
    'steps' | 'completedStepActionKeys' | 'isHidden' | 'snoozedUntil'
  >;
  now: Date;
}): boolean => {
  if (progress.isHidden) {
    return false;
  }

  const remainingSteps = getGettingStartedRemainingSteps({
    steps: progress.steps,
    completedStepActionKeys: progress.completedStepActionKeys,
  });

  if (remainingSteps.length === 0) {
    return false;
  }

  return (
    !isDefined(progress.snoozedUntil) ||
    Date.parse(progress.snoozedUntil) <= now.getTime()
  );
};
