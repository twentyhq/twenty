import { type Logger } from '@nestjs/common';

import { buildJobMemoryLimitRefusalLogMessage } from 'src/engine/core-modules/message-queue/drivers/memory/build-job-memory-limit-refusal-log-message.util';
import { type JobMemoryLimitRefusal } from 'src/engine/core-modules/message-queue/drivers/memory/job-memory-limit-refusal.type';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

export const reportJobMemoryLimitRefusal = ({
  logger,
  metricsService,
  refusal,
}: {
  logger: Pick<Logger, 'warn'>;
  metricsService: Pick<MetricsService, 'incrementCounterForEvent'>;
  refusal: JobMemoryLimitRefusal;
}): void => {
  logger.warn(buildJobMemoryLimitRefusalLogMessage(refusal));

  void metricsService.incrementCounterForEvent({
    key: MetricsKeys.JobMemoryLimitRefused,
    attributes: {
      queue: refusal.queueName,
      job_name: refusal.jobName,
      reason: refusal.reason,
    },
    shouldStoreInCache: false,
  });
};
