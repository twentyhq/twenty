import { type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';

import PgBoss from 'pg-boss';

import {
  type QueueCronJobOptions,
  type QueueJobOptions,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type MessageQueueJob } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { type MessageQueueWorkerOptions } from 'src/engine/core-modules/message-queue/interfaces/message-queue-worker-options.interface';
import { type MessageQueueDriver } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';

import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getJobKey } from 'src/engine/core-modules/message-queue/utils/get-job-key.util';

export type PgBossDriverOptions = PgBoss.ConstructorOptions;

const DEFAULT_PG_BOSS_CRON_PATTERN_WHEN_NOT_PROVIDED = '*/1 * * * *';

export class PgBossDriver
  implements MessageQueueDriver, OnModuleInit, OnModuleDestroy
{
  private pgBoss: PgBoss;

  constructor(options: PgBossDriverOptions) {
    this.pgBoss = new PgBoss(options);
  }

  async onModuleInit() {
    await this.pgBoss.start();
  }

  async onModuleDestroy() {
    await this.pgBoss.stop();
  }

  async work<T>(
    queueName: string,
    handler: (job: MessageQueueJob<T>) => Promise<void>,
    options?: MessageQueueWorkerOptions,
  ) {
    return this.pgBoss.work<T>(
      `${queueName}.*`,
      options?.concurrency
        ? {
            teamConcurrency: options.concurrency,
          }
        : {},
      async (job) => {
        // PGBoss work with wildcard job name
        const jobName = job.name.split('.')?.[1];

        if (!jobName) {
          throw new Error('Job name could not be splited from the job.');
        }

        await handler({
          data: job.data,
          id: job.id,
          name: jobName,
        });
      },
    );
  }

  async addCron<T>({
    queueName,
    jobName,
    data,
    options,
    jobId,
  }: {
    queueName: MessageQueue;
    jobName: string;
    data: T;
    options: QueueCronJobOptions;
    jobId?: string;
  }): Promise<void> {
    const name = `${queueName}.${getJobKey({ jobName, jobId })}`;

    await this.pgBoss.schedule(
      name,
      options.repeat.pattern ?? DEFAULT_PG_BOSS_CRON_PATTERN_WHEN_NOT_PROVIDED,
      data as object,
    );
  }

  async removeCron({
    queueName,
    jobName,
    jobId,
  }: {
    queueName: MessageQueue;
    jobName: string;
    jobId?: string;
  }): Promise<void> {
    const name = `${queueName}.${getJobKey({ jobName, jobId })}`;

    await this.pgBoss.unschedule(name);
  }

  async add<T>(
    queueName: MessageQueue,
    jobName: string,
    data: T,
    options?: QueueJobOptions,
  ): Promise<void> {
    await this.pgBoss.send(
      `${queueName}.${jobName}`,
      data as object,
      options
        ? {
            ...options,
            singletonKey: options?.id,
            useSingletonQueue: true, // When used with singletonKey, ensures only one job can be queued. See https://logsnag.com/blog/deep-dive-into-background-jobs-with-pg-boss-and-typescript
          }
        : {},
    );
  }
}
