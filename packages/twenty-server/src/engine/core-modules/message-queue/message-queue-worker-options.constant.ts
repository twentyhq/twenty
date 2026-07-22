import { AI_STREAM_LOCK_DURATION_MS } from 'src/engine/core-modules/message-queue/constants/ai-stream-lock-duration.constant';
import { type MessageQueueWorkerOptions } from 'src/engine/core-modules/message-queue/interfaces/message-queue-worker-options.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export const QUEUE_WORKER_OPTIONS: Partial<
  Record<MessageQueue, MessageQueueWorkerOptions>
> = {
  [MessageQueue.aiStreamQueue]: {
    concurrency: 20,
    lockDuration: AI_STREAM_LOCK_DURATION_MS,
    maxStalledCount: 0,
    boundedShutdownDrain: true,
  },
  [MessageQueue.logicFunctionQueue]: { concurrency: 10 },
};
