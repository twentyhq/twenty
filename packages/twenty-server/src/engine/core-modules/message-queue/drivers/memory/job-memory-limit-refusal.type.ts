import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type JobMemoryLimitRefusal = {
  queueName: MessageQueue;
  groupKey: string;
  reason: 'share' | 'size';
  requestedBytes: number;
  usedBytes?: number;
  limitBytes: number;
};
