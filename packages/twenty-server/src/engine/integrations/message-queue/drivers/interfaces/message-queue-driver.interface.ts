import {
  QueueCronJobOptions,
  QueueJobOptions,
} from 'src/engine/integrations/message-queue/drivers/interfaces/job-options.interface';
import { MessageQueueJobData } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';

export interface MessageQueueDriver {
  add<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    jobName: string,
    data: T,
    options?: QueueJobOptions,
  ): Promise<void>;
  work<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    handler: ({ data, id }: { data: T; id: string }) => Promise<void> | void,
  );
  addCron<T extends MessageQueueJobData | undefined>(
    queueName: MessageQueue,
    jobName: string,
    data: T,
    options?: QueueCronJobOptions,
  );
  removeCron(queueName: MessageQueue, jobName: string, pattern?: string);
  stop?(): Promise<void>;
  register?(queueName: MessageQueue): void;
}
