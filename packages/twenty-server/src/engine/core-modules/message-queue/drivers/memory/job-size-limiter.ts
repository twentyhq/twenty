import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { buildJobMemoryLimitRefusalLogMessage } from 'src/engine/core-modules/message-queue/drivers/memory/build-job-memory-limit-refusal-log-message.util';
import { type JobMemoryLimitRefusal } from 'src/engine/core-modules/message-queue/drivers/memory/job-memory-limit-refusal.type';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  MessageQueueException,
  MessageQueueExceptionCode,
} from 'src/engine/core-modules/message-queue/message-queue.exception';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

export type SizedJob = { index: number; groupKey: string; sizeBytes: number };

type JobSizeLimiterOptions = {
  metricsService: MetricsService;
  isEnabled: () => boolean;
  getMaxJobSizeBytes: () => number;
};

export class JobSizeLimiter {
  private readonly logger = new Logger(JobSizeLimiter.name);

  constructor(private readonly options: JobSizeLimiterOptions) {}

  isEnabled(): boolean {
    return this.options.isEnabled();
  }

  checkJobSizesOrThrow({
    queueName,
    jobs,
  }: {
    queueName: MessageQueue;
    jobs: SizedJob[];
  }): void {
    if (!this.isEnabled()) {
      return;
    }

    const maxBytes = this.options.getMaxJobSizeBytes();
    const oversizedJob = jobs.find(({ sizeBytes }) => sizeBytes > maxBytes);

    if (!isDefined(oversizedJob)) {
      return;
    }

    const { index, groupKey, sizeBytes } = oversizedJob;

    this.reportRefusal({
      queueName,
      groupKey,
      reason: 'size',
      requestedBytes: sizeBytes,
      limitBytes: maxBytes,
    });

    throw new MessageQueueException(
      `Job ${index} on queue ${queueName} is ${sizeBytes} bytes, above the ${maxBytes} bytes limit`,
      MessageQueueExceptionCode.JOB_TOO_LARGE,
      { index, sizeBytes, maxBytes },
    );
  }

  private reportRefusal(refusal: JobMemoryLimitRefusal): void {
    this.logger.warn(buildJobMemoryLimitRefusalLogMessage(refusal));

    void this.options.metricsService.incrementCounterForEvent({
      key: MetricsKeys.JobMemoryLimitRefused,
      attributes: { queue: refusal.queueName, reason: refusal.reason },
      shouldStoreInCache: false,
    });
  }
}
