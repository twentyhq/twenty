import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { reportJobMemoryLimitRefusal } from 'src/engine/core-modules/message-queue/drivers/memory/report-job-memory-limit-refusal.util';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  MessageQueueException,
  MessageQueueExceptionCode,
} from 'src/engine/core-modules/message-queue/message-queue.exception';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';

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

  checkJobSizes({
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

    reportJobMemoryLimitRefusal({
      logger: this.logger,
      metricsService: this.options.metricsService,
      refusal: {
        queueName,
        groupKey,
        reason: 'size',
        requestedBytes: sizeBytes,
        limitBytes: maxBytes,
      },
    });

    throw new MessageQueueException(
      `Job ${index} on queue ${queueName} is ${sizeBytes} bytes, above the ${maxBytes} bytes limit`,
      MessageQueueExceptionCode.JOB_TOO_LARGE,
      { index, sizeBytes, maxBytes },
    );
  }
}
