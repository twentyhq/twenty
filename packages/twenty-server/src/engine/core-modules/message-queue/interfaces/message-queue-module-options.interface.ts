import { type BullMQDriverOptions } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';

export enum MessageQueueDriverType {
  BULL_MQ = 'BULL_MQ',
  SYNC = 'SYNC',
}

export interface BullMQDriverFactoryOptions {
  type: MessageQueueDriverType.BULL_MQ;
  options: BullMQDriverOptions;
}

export interface SyncDriverFactoryOptions {
  type: MessageQueueDriverType.SYNC;
   
  options: Record<string, any>;
}

export type MessageQueueModuleOptions =
  | BullMQDriverFactoryOptions
  | SyncDriverFactoryOptions;
