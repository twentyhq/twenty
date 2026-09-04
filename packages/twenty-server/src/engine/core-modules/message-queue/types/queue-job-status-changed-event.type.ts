import { type QueueJobDetails } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import { type MessageQueueJobData } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';

import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type QueueJobStatusChangedEvent = {
  queueName: MessageQueue;
  job: QueueJobDetails<MessageQueueJobData>;
};
