import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type JobQueueMemoryLimitMode } from 'src/engine/core-modules/message-queue/types/job-queue-memory-limit-mode.type';

export type JobMemoryLimitRefusal = {
  queueName: MessageQueue;
  groupKey: string;
  reason: 'share' | 'size';
  mode: Exclude<JobQueueMemoryLimitMode, 'off'>;
  requestedBytes: number;
  usedBytes?: number;
  limitBytes: number;
};
