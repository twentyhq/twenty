import { type MessageQueueLimiter } from 'src/engine/core-modules/message-queue/types/message-queue-limiter.type';

export interface MessageQueueWorkerOptions {
  concurrency?: number;
  globalConcurrency?: number;
  globalLimiter?: MessageQueueLimiter;
  groupLimiter?: MessageQueueLimiter;
  lockDuration?: number;
  maxStalledCount?: number;
  boundedShutdownDrain?: boolean;
}
