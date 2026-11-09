import { type MessageQueueGroupMaxRate } from 'src/engine/core-modules/message-queue/types/message-queue-group-max-rate.type';

export type MessageQueueGroupConfig = {
  maxRate?: MessageQueueGroupMaxRate;
  weight?: number;
};
