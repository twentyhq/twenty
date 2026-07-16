import { Inject, Injectable, Optional } from '@nestjs/common';

import { BullMQDriver } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Injectable()
export class DeadLetterRedriveService {
  constructor(
    @Optional()
    @Inject(BullMQDriver)
    private readonly bullMqDriver?: BullMQDriver,
  ) {}

  /**
   * Re-enqueue failed (dead-lettered) jobs from a BullMQ queue so they are
   * retried. Failed jobs that match the optional `jobName` filter are
   * re-added via the BullMQ driver, carrying forward the original job id
   * as an idempotencyKey for idempotent redrive. After a successful re-add
   * the failed entry is removed.
   */
  async redrive({
    queueName,
    jobName,
    limit,
  }: {
    queueName: MessageQueue;
    jobName?: string;
    limit?: number;
  }): Promise<void> {
    if (!this.bullMqDriver) {
      throw new Error(
        'DeadLetterRedriveService requires BullMQ driver – the Sync driver does not support failed job queries',
      );
    }

    const queue = this.bullMqDriver.getQueue(queueName);
    const failedJobs = await queue.getJobs(['failed']);
    let processed = 0;

    for (const failedJob of failedJobs) {
      if (limit !== undefined && processed >= limit) {
        break;
      }

      if (jobName !== undefined && failedJob.name !== jobName) {
        continue;
      }

      // Carry forward the original job id as idempotencyKey so the redrive
      // is idempotent: calling redrive again for the same failed job produces
      // the same idempotencyKey, which the driver maps to the same BullMQ
      // jobId for native dedup.
      const options: QueueJobOptions = {
        idempotencyKey: failedJob.id ?? undefined,
      };

      // Re-add through the driver so the idempotency-key path is used.
      await this.bullMqDriver.add(
        queueName,
        failedJob.name,
        failedJob.data,
        options,
      );

      // Remove the failed entry after successful re-add
      await failedJob.remove();
      processed++;
    }
  }
}
