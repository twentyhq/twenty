import {
  GETTING_STARTED_STEPS,
  type GettingStartedProgress,
} from 'twenty-shared/types';

export const shouldOpenGettingStarted = (
  progress: GettingStartedProgress | undefined,
  now = Date.now(),
) =>
  Boolean(
    progress &&
    GETTING_STARTED_STEPS.some(
      (step) => !progress.completedSteps.includes(step),
    ) &&
    (!progress.snoozedUntil || Date.parse(progress.snoozedUntil) <= now),
  );
