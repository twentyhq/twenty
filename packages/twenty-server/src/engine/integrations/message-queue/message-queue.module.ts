import { DynamicModule, Global } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { MessageQueueDriver } from 'src/engine/integrations/message-queue/drivers/interfaces/message-queue-driver.interface';

import {
  MessageQueueDriverType,
  MessageQueueModuleAsyncOptions,
} from 'src/engine/integrations/message-queue/interfaces';
import {
  MessageQueue,
  QUEUE_DRIVER,
} from 'src/engine/integrations/message-queue/message-queue.constants';
import { PgBossDriver } from 'src/engine/integrations/message-queue/drivers/pg-boss.driver';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { BullMQDriver } from 'src/engine/integrations/message-queue/drivers/bullmq.driver';
import { SyncDriver } from 'src/engine/integrations/message-queue/drivers/sync.driver';
import { getQueueToken } from 'src/engine/integrations/message-queue/utils/get-queue-token.util';

@Global()
export class MessageQueueModule {
  static forRoot(options: MessageQueueModuleAsyncOptions): DynamicModule {
    const providers = [
      ...Object.values(MessageQueue).map((queueName) => ({
        provide: getQueueToken(queueName),
        useFactory: (driver: MessageQueueDriver) => {
          return new MessageQueueService(driver, queueName);
        },
        inject: [QUEUE_DRIVER],
      })),
      {
        provide: QUEUE_DRIVER,
        useFactory: async (...args: any[]) => {
          const config = await options.useFactory(...args);

          switch (config.type) {
            case MessageQueueDriverType.PgBoss: {
              const boss = new PgBossDriver(config.options);

              await boss.init();

              return boss;
            }
            case MessageQueueDriverType.BullMQ: {
              return new BullMQDriver(config.options);
            }
            default: {
              return new SyncDriver();
            }
          }
        },
        inject: options.inject || [],
      },
    ];

    return {
      module: MessageQueueModule,
      imports: [DiscoveryModule, ...(options.imports || [])],
      providers,
      exports: Object.values(MessageQueue).map((queueName) =>
        getQueueToken(queueName),
      ),
    };
  }
}
