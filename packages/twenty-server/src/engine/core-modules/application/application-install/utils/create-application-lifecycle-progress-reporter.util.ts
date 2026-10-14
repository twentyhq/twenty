import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type ApplicationLifecycleProgressReporter } from 'src/engine/core-modules/application/application-install/types/application-lifecycle-progress-reporter.type';
import { type MessageQueueJobProgressContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';

const logger = new Logger('ApplicationLifecycleProgressReporter');

const STEP_PROGRESS_REPORT_INTERVAL_MS = 1_000;

export const createApplicationLifecycleProgressReporter = <
  TStep extends string,
>({
  steps,
  updateProgress,
}: {
  steps: readonly TStep[];
  updateProgress?: MessageQueueJobProgressContext['updateProgress'];
}): ApplicationLifecycleProgressReporter<TStep> => {
  let lastReportedPercentage = 0;

  const reportStepFractionCompleted = async (
    step: TStep,
    fractionCompleted: number,
  ) => {
    if (!isDefined(updateProgress)) {
      return;
    }

    const completedStepCount =
      steps.indexOf(step) + Math.min(fractionCompleted, 1);
    const percentage = Math.round((completedStepCount / steps.length) * 100);

    // Each update is a Redis write and an event stream broadcast, and elapsed
    // time ticks mostly land on the percentage already reported
    if (percentage <= lastReportedPercentage) {
      return;
    }

    lastReportedPercentage = percentage;

    try {
      await updateProgress(percentage);
    } catch (error) {
      logger.warn(
        `Failed to report progress for step ${step}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return {
    reportStepCompleted: (step) => reportStepFractionCompleted(step, 1),
    reportStepProgressDuring: async ({ step, expectedDurationMs, run }) => {
      if (!isDefined(updateProgress)) {
        return run();
      }

      const startedAt = Date.now();
      const interval = setInterval(
        () =>
          void reportStepFractionCompleted(
            step,
            (Date.now() - startedAt) / expectedDurationMs,
          ),
        STEP_PROGRESS_REPORT_INTERVAL_MS,
      );

      try {
        await run();
      } finally {
        clearInterval(interval);
      }
    },
  };
};
