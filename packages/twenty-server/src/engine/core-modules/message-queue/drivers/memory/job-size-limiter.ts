import { Logger } from '@nestjs/common';

import { JOB_QUEUE_MEMORY_LIMIT_MODE } from 'src/engine/core-modules/message-queue/constants/job-queue-memory-limit-mode.constant';
import { reportJobMemoryLimitRefusal } from 'src/engine/core-modules/message-queue/drivers/memory/report-job-memory-limit-refusal.util';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  MessageQueueException,
  MessageQueueExceptionCode,
} from 'src/engine/core-modules/message-queue/message-queue.exception';
import { type JobQueueMemoryLimitMode } from 'src/engine/core-modules/message-queue/types/job-queue-memory-limit-mode.type';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';

export type SizedJob = { groupKey: string; sizeBytes: number };

type JobSizeLimiterOptions = {
  metricsService: MetricsService;
  getMode: () => JobQueueMemoryLimitMode;
  getMaxJobSizeBytes: () => number;
};

export class JobSizeLimiter {
  private readonly logger = new Logger(JobSizeLimiter.name);

  constructor(private readonly options: JobSizeLimiterOptions) {}

  checkJobSizes({
    queueName,
    jobs,
  }: {
    queueName: MessageQueue;
    jobs: SizedJob[];
  }): void {
    const mode = this.options.getMode();

    if (
      mode !== JOB_QUEUE_MEMORY_LIMIT_MODE.OBSERVE &&
      mode !== JOB_QUEUE_MEMORY_LIMIT_MODE.ENFORCE
    ) {
      return;
    }

    const maxBytes = this.options.getMaxJobSizeBytes();
    const oversizedJobIndexes = jobs.flatMap(({ sizeBytes }, index) =>
      sizeBytes > maxBytes ? [index] : [],
    );

    for (const index of oversizedJobIndexes) {
      reportJobMemoryLimitRefusal({
        logger: this.logger,
        metricsService: this.options.metricsService,
        refusal: {
          queueName,
          groupKey: jobs[index].groupKey,
          reason: 'size',
          mode,
          requestedBytes: jobs[index].sizeBytes,
          limitBytes: maxBytes,
        },
      });
    }

    const [firstOversizedJobIndex] = oversizedJobIndexes;

    if (
      mode !== JOB_QUEUE_MEMORY_LIMIT_MODE.ENFORCE ||
      firstOversizedJobIndex === undefined
    ) {
      return;
    }

    const sizeBytes = jobs[firstOversizedJobIndex].sizeBytes;

    throw new MessageQueueException(
      `Job ${firstOversizedJobIndex} on queue ${queueName} is ${sizeBytes} bytes, above the ${maxBytes} bytes limit`,
      MessageQueueExceptionCode.JOB_TOO_LARGE,
      { index: firstOversizedJobIndex, sizeBytes, maxBytes },
    );
  }
}
