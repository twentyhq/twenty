import { Inject, Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import {
  type QueueCronJobOptions,
  type QueueJobOptions,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import {
  type InFlightQueueJob,
  MessageQueueDriver,
  type QueueJobDetails,
  type QueueJobToAdd,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import {
  type MessageQueueJobData,
  type MessageQueueJob,
} from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { type MessageQueueWorkerOptions } from 'src/engine/core-modules/message-queue/interfaces/message-queue-worker-options.interface';

import {
  MessageQueue,
  QUEUE_DRIVER,
} from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  MessageQueueException,
  MessageQueueExceptionCode,
} from 'src/engine/core-modules/message-queue/message-queue.exception';

@Injectable()
export class MessageQueueService {
  constructor(
    @Inject(QUEUE_DRIVER) protected driver: MessageQueueDriver,
    protected queueName: MessageQueue,
  ) {
    if (typeof this.driver.register === 'function') {
      this.driver.register(queueName);
    }
  }

  add<T extends MessageQueueJobData>(
    jobName: string,
    data: T,
    options?: QueueJobOptions,
  ): Promise<string | undefined> {
    this.assertStatusBroadcastRecipient(jobName, data, options);

    return this.driver.add(this.queueName, jobName, data, options);
  }

  bulkAdd<T extends MessageQueueJobData>(
    jobName: string,
    jobs: QueueJobToAdd<T>[],
    options?: QueueJobOptions,
  ): Promise<string[]> {
    for (const job of jobs) {
      this.assertStatusBroadcastRecipient(jobName, job.data, options);
    }

    return this.driver.bulkAdd(this.queueName, jobName, jobs, options);
  }

  private assertStatusBroadcastRecipient(
    jobName: string,
    data: MessageQueueJobData,
    options?: QueueJobOptions,
  ): void {
    if (!options?.shouldBroadcastStatus) {
      return;
    }

    if (
      !isNonEmptyString(data.workspaceId) ||
      !isNonEmptyString(data.userWorkspaceId)
    ) {
      throw new MessageQueueException(
        `Job ${jobName} on queue ${this.queueName} broadcasts its status but its data has no workspaceId and userWorkspaceId`,
        MessageQueueExceptionCode.STATUS_BROADCAST_RECIPIENT_MISSING,
      );
    }
  }

  getJobs<T extends MessageQueueJobData>(
    jobIds: string[],
  ): Promise<Partial<Record<string, QueueJobDetails<T>>>> {
    if (typeof this.driver.getJobs !== 'function') {
      return Promise.resolve({});
    }

    return this.driver.getJobs(this.queueName, jobIds);
  }

  getInFlightJobs<T extends MessageQueueJobData>(): Promise<
    InFlightQueueJob<T>[]
  > {
    if (typeof this.driver.getInFlightJobs !== 'function') {
      return Promise.resolve([]);
    }

    return this.driver.getInFlightJobs(this.queueName);
  }

  addCron<T extends MessageQueueJobData | undefined>({
    jobName,
    data,
    options,
    jobId,
  }: {
    jobName: string;
    data: T;
    options: QueueCronJobOptions;
    jobId?: string;
  }): Promise<void> {
    return this.driver.addCron({
      queueName: this.queueName,
      jobName,
      data,
      options,
      jobId,
    });
  }

  removeCron({
    jobName,
    jobId,
  }: {
    jobName: string;
    jobId?: string;
  }): Promise<void> {
    return this.driver.removeCron({
      queueName: this.queueName,
      jobName,
      jobId,
    });
  }

  work<T extends MessageQueueJobData>(
    handler: (job: MessageQueueJob<T>) => Promise<void> | void,
    options?: MessageQueueWorkerOptions,
  ): void {
    this.driver.work(this.queueName, handler, options);
  }
}
