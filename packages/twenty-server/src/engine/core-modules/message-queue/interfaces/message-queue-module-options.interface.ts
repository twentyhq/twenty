import { type BullMQDriverOptions } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';

export enum MessageQueueDriverType {
  BullMQ = 'bull-mq',
  Sync = 'sync',
}

export interface BullMQDriverFactoryOptions {
  type: MessageQueueDriverType.BullMQ;
  options: BullMQDriverOptions;
}

export interface SyncDriverFactoryOptions {
  type: MessageQueueDriverType.Sync;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: Record<string, any>;
}

export type MessageQueueModuleOptions =
  | BullMQDriverFactoryOptions
  | SyncDriverFactoryOptions;
