import { type MessageQueueLimiter } from 'src/engine/core-modules/message-queue/types/message-queue-limiter.type';

export type JobGroupConfig = {
  limiter: MessageQueueLimiter | null;
};
