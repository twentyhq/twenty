import {
  QueueCronJobOptions,
  QueueJobOptions,
} from 'src/engine/integrations/message-queue/drivers/interfaces/job-options.interface';
import { MessageQueueJobData } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';
import { MessageQueueWorkerOptions } from 'src/engine/integrations/message-queue/interfaces/message-queue-worker-options.interface';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';

export interface FlowDefinition<T extends MessageQueueJobData> {
  queueName: MessageQueue;
  /**
   * Job name
   */
  name: string;
  data: T;
  options?: QueueJobOptions;
  children?: FlowDefinition<T>[];
}

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
    options?: MessageQueueWorkerOptions,
  );
  addCron<T extends MessageQueueJobData | undefined>(
    queueName: MessageQueue,
    jobName: string,
    data: T,
    options?: QueueCronJobOptions,
  );
  removeCron(queueName: MessageQueue, jobName: string, pattern?: string);
  addFlow<T extends MessageQueueJobData>(flow: FlowDefinition<T>): void;
  register?(queueName: MessageQueue): void;
}
