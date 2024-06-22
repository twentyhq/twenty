import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import PgBoss from 'pg-boss';

import {
  QueueCronJobOptions,
  QueueJobOptions,
} from 'src/engine/integrations/message-queue/drivers/interfaces/job-options.interface';
import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';
import { MessageQueueWorkerOptions } from 'src/engine/integrations/message-queue/interfaces/message-queue-worker-options.interface';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';

import { MessageQueueDriver } from './interfaces/message-queue-driver.interface';

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
        await handler({
          data: job.data,
          id: job.id,
          name: job.name.split('.')[1],
        });
      },
    );
  }

  async addCron<T>(
    queueName: MessageQueue,
    jobName: string,
    data: T,
    options?: QueueCronJobOptions,
  ): Promise<void> {
    await this.pgBoss.schedule(
      `${queueName}.${jobName}`,
      options?.repeat?.pattern ??
        DEFAULT_PG_BOSS_CRON_PATTERN_WHEN_NOT_PROVIDED,
      data as object,
      options
        ? {
            singletonKey: options?.id,
          }
        : {},
    );
  }

  async removeCron(queueName: MessageQueue, jobName: string): Promise<void> {
    await this.pgBoss.unschedule(`${queueName}.${jobName}`);
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
          }
        : {},
    );
  }
}
