import { type DynamicModule, Global, Module, forwardRef } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { MessageQueueCoreModule } from 'src/engine/core-modules/message-queue/message-queue-core.module';
import { MessageQueueMetadataAccessor } from 'src/engine/core-modules/message-queue/message-queue-metadata.accessor';
import { MessageQueueExplorer } from 'src/engine/core-modules/message-queue/message-queue.explorer';
import { EventLoopStallMonitorService } from 'src/engine/core-modules/message-queue/services/event-loop-stall-monitor.service';
import {
  type ASYNC_OPTIONS_TYPE,
  type OPTIONS_TYPE,
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
      imports: [DiscoveryModule, forwardRef(() => BillingModule)],
      providers: [
        MessageQueueExplorer,
        MessageQueueMetadataAccessor,
        EventLoopStallMonitorService,
      ],
    };
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return {
      module: MessageQueueModule,
      imports: [MessageQueueCoreModule.registerAsync(options)],
    };
  }
}
