import {
  type DynamicModule,
  Global,
  Logger,
  Module,
  type Provider,
} from '@nestjs/common';

import { type MessageQueueDriver } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';

import { BullMQDriver } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import { SyncDriver } from 'src/engine/core-modules/message-queue/drivers/sync.driver';
import { ThrottledMessageQueueDriver } from 'src/engine/core-modules/message-queue/drivers/throttled-message-queue.driver';
import { JobEnqueueThrottlerGuard } from 'src/engine/core-modules/message-queue/guards/job-enqueue-throttler.guard';
import { MessageQueueDriverType } from 'src/engine/core-modules/message-queue/interfaces';
import {
  MessageQueue,
  QUEUE_DRIVER,
} from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  type ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  type OPTIONS_TYPE,
} from 'src/engine/core-modules/message-queue/message-queue.module-definition';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';

@Global()
@Module({})
export class MessageQueueCoreModule extends ConfigurableModuleClass {
  private static readonly logger = new Logger(MessageQueueCoreModule.name);

  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    const dynamicModule = super.register(options);

    const driverProvider: Provider = {
      provide: QUEUE_DRIVER,
      useFactory: async (guard: JobEnqueueThrottlerGuard) => {
        return new ThrottledMessageQueueDriver(
          await this.createDriver(options),
          guard,
        );
      },
      inject: [JobEnqueueThrottlerGuard],
    };

    const queueProviders = this.createQueueProviders();

    return {
      ...dynamicModule,
      imports: [
        ...(dynamicModule.imports ?? []),
        MetricsModule,
        ThrottlerModule,
      ],
      providers: [
        ...(dynamicModule.providers ?? []),
        JobEnqueueThrottlerGuard,
        driverProvider,
        ...queueProviders,
      ],
      exports: [
        ...(dynamicModule.exports ?? []),
        ...Object.values(MessageQueue).map((queueName) =>
          getQueueToken(queueName),
        ),
      ],
    };
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const dynamicModule = super.registerAsync(options);

    const driverProvider: Provider = {
      provide: QUEUE_DRIVER,
      useFactory: async (
        guard: JobEnqueueThrottlerGuard,
        // oxlint-disable-next-line typescript/no-explicit-any
        ...args: any[]
      ) => {
        if (options.useFactory) {
          const config = await options.useFactory(...args);

          return new ThrottledMessageQueueDriver(
            await this.createDriver(config),
            guard,
          );
        }
        throw new Error('useFactory is not defined');
      },
      inject: [JobEnqueueThrottlerGuard, ...(options.inject || [])],
    };

    const queueProviders = MessageQueueCoreModule.createQueueProviders();

    return {
      ...dynamicModule,
      imports: [
        ...(dynamicModule.imports ?? []),
        MetricsModule,
        ThrottlerModule,
      ],
      providers: [
        ...(dynamicModule.providers ?? []),
        JobEnqueueThrottlerGuard,
        driverProvider,
        ...queueProviders,
      ],
      exports: [
        ...(dynamicModule.exports ?? []),
        ...Object.values(MessageQueue).map((queueName) =>
          getQueueToken(queueName),
        ),
      ],
    };
  }

  static async createDriver(config: typeof OPTIONS_TYPE) {
    switch (config.type) {
      case MessageQueueDriverType.BullMQ: {
        return new BullMQDriver(
          config.options,
          config.metricsService,
          config.twentyConfigService,
        );
      }
      case MessageQueueDriverType.Sync: {
        return new SyncDriver();
      }
      default: {
        this.logger.warn(
          `Unsupported message queue driver type: ${(config as { type: string })?.type}. Using SyncDriver by default.`,
        );

        return new SyncDriver();
      }
    }
  }

  static createQueueProviders(): Provider[] {
    return Object.values(MessageQueue).map((queueName) => ({
      provide: getQueueToken(queueName),
      useFactory: (driver: MessageQueueDriver) => {
        return new MessageQueueService(driver, queueName);
      },
      inject: [QUEUE_DRIVER],
    }));
  }
}
