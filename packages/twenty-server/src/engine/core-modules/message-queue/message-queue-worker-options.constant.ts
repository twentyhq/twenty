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
  // Kept low because each job fans out to up to DATABASE_EVENT_JOBS_CHUNK_SIZE
  // executions in parallel, and executions call back into the core API: with
  // N worker pods the worst case is N * concurrency * chunkSize concurrent
  // API calls competing with user traffic.
  [MessageQueue.logicFunctionQueue]: { concurrency: 2 },
};
