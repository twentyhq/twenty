import { type MessageQueueJobData } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';

import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type QueueJobFailedEvent = {
  queueName: MessageQueue;
  job: {
    id: string;
    name: string;
    data: MessageQueueJobData;
    attemptsMade: number;
  };
  error: {
    name: string;
    message: string;
  };
};
