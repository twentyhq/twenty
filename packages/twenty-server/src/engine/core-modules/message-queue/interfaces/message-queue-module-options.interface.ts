import { BullMQDriverOptions } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import { PgBossDriverOptions } from 'src/engine/core-modules/message-queue/drivers/pg-boss.driver';

export enum MessageQueueDriverType {
  PgBoss = 'pg-boss',
  BullMQ = 'bull-mq',
  Sync = 'sync',
}

export interface PgBossDriverFactoryOptions {
  type: MessageQueueDriverType.PgBoss;
  options: PgBossDriverOptions;
}

export interface BullMQDriverFactoryOptions {
  type: MessageQueueDriverType.BullMQ;
  options: BullMQDriverOptions;
}

export interface SyncDriverFactoryOptions {
  type: MessageQueueDriverType.Sync;
  options: Record<string, any>;
}

export type MessageQueueModuleOptions =
  | PgBossDriverFactoryOptions
  | BullMQDriverFactoryOptions
  | SyncDriverFactoryOptions;
