import { DynamicModule, Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { MessageQueueCoreModule } from 'src/engine/core-modules/message-queue/message-queue-core.module';
import { MessageQueueMetadataAccessor } from 'src/engine/core-modules/message-queue/message-queue-metadata.accessor';
import { MessageQueueExplorer } from 'src/engine/core-modules/message-queue/message-queue.explorer';
import {
  ASYNC_OPTIONS_TYPE,
  OPTIONS_TYPE,
} from 'src/engine/core-modules/message-queue/message-queue.module-definition';

@Global()
@Module({})
export class MessageQueueModule {
  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    return {
      module: MessageQueueModule,
      imports: [MessageQueueCoreModule.register(options)],
    };
  }

  static registerExplorer(): DynamicModule {
    return {
      module: MessageQueueModule,
      imports: [DiscoveryModule],
      providers: [MessageQueueExplorer, MessageQueueMetadataAccessor],
    };
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return {
      module: MessageQueueModule,
      imports: [MessageQueueCoreModule.registerAsync(options)],
    };
  }
}
