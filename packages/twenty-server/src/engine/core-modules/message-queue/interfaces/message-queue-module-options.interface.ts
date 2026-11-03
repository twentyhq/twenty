import { type EventEmitter2 } from '@nestjs/event-emitter';

import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type BullMQDriverOptions } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export enum MessageQueueDriverType {
  BullMQ = 'bull-mq',
  Sync = 'sync',
}

export interface BullMQDriverFactoryOptions {
  type: MessageQueueDriverType.BullMQ;
  options: BullMQDriverOptions;
  metricsService: MetricsService;
  twentyConfigService: TwentyConfigService;
  eventEmitter: EventEmitter2;
  featureFlagService: FeatureFlagService;
}

export interface SyncDriverFactoryOptions {
  type: MessageQueueDriverType.Sync;
  // oxlint-disable-next-line typescript/no-explicit-any
  options: Record<string, any>;
}

export type MessageQueueModuleOptions =
  | BullMQDriverFactoryOptions
  | SyncDriverFactoryOptions;
