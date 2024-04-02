import { ModuleRef } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { MessageQueueDriver } from 'src/engine/integrations/message-queue/drivers/interfaces/message-queue-driver.interface';
import {
  MessageQueueCronJobData,
  MessageQueueJob,
  MessageQueueJobData,
} from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { getJobClassName } from 'src/engine/integrations/message-queue/utils/get-job-class-name.util';

export class SyncDriver implements MessageQueueDriver {
  private readonly logger = new Logger(SyncDriver.name);
  constructor(private readonly jobsModuleRef: ModuleRef) {}

  async add<T extends MessageQueueJobData>(
    _queueName: MessageQueue,
    jobName: string,
    data: T,
  ): Promise<void> {
    const jobClassName = getJobClassName(jobName);
    const job: MessageQueueJob<MessageQueueJobData> = this.jobsModuleRef.get(
      jobClassName,
      { strict: true },
    );

    await job.handle(data);
  }

  async addCron<T extends MessageQueueJobData | undefined>(
    _queueName: MessageQueue,
    jobName: string,
    data: T,
  ): Promise<void> {
    this.logger.log(`Running cron job with SyncDriver`);

    const jobClassName = getJobClassName(jobName);
    const job: MessageQueueCronJobData<MessageQueueJobData | undefined> =
      this.jobsModuleRef.get(jobClassName, {
        strict: true,
      });

    await job.handle(data);
  }

  async removeCron(_queueName: MessageQueue, jobName: string) {
    this.logger.log(`Removing '${jobName}' cron job with SyncDriver`);

    return;
  }

  work() {
    return;
  }
}
