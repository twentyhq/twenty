import { type MessageQueueWorkerOptions } from 'src/engine/core-modules/message-queue/interfaces/message-queue-worker-options.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export const AI_STREAM_LOCK_DURATION_MS = 10 * 60 * 1000;

export const QUEUE_WORKER_OPTIONS: Partial<
  Record<MessageQueue, MessageQueueWorkerOptions>
> = {
  [MessageQueue.aiStreamQueue]: {
    concurrency: 20,
    lockDuration: AI_STREAM_LOCK_DURATION_MS,
  },
  [MessageQueue.logicFunctionQueue]: { concurrency: 10 },
};
