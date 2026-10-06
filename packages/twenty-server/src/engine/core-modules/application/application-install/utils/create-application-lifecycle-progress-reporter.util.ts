import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type ApplicationLifecycleProgressReporter } from 'src/engine/core-modules/application/application-install/types/application-lifecycle-progress-reporter.type';
import { type MessageQueueJobProgressContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';

const logger = new Logger('ApplicationLifecycleProgressReporter');

export const createApplicationLifecycleProgressReporter = <
  TStep extends string,
>({
  steps,
  updateProgress,
}: {
  steps: readonly TStep[];
  updateProgress?: MessageQueueJobProgressContext['updateProgress'];
}): ApplicationLifecycleProgressReporter<TStep> => ({
  reportStepCompleted: async (step) => {
    if (!isDefined(updateProgress)) {
      return;
    }

    const completedStepCount = steps.indexOf(step) + 1;
    const percentage = Math.round((completedStepCount / steps.length) * 100);

    try {
      await updateProgress(percentage);
    } catch (error) {
      logger.warn(
        `Failed to report progress for step ${step}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});
