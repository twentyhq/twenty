import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export const QUEUE_WORKER_OPTIONS: Partial<
  Record<MessageQueue, { concurrency: number }>
> = {
  [MessageQueue.aiStreamQueue]: { concurrency: 20 },
};
