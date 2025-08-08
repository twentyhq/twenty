import {
  type BullMQDriverFactoryOptions,
  MessageQueueDriverType,
  type MessageQueueModuleOptions,
} from 'src/engine/core-modules/message-queue/interfaces';
import { type RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

/**
 * MessageQueue Module factory
 * @returns MessageQueueModuleOptions
 * @param twentyConfigService
 */
export const messageQueueModuleFactory = async (
  _twentyConfigService: TwentyConfigService,
  redisClientService: RedisClientService,
): Promise<MessageQueueModuleOptions> => {
  const driverType = MessageQueueDriverType.BullMQ;

  switch (driverType) {
    /* 
    case MessageQueueDriverType.Sync: {
      return {
        type: MessageQueueDriverType.Sync,
        options: {},
      } satisfies SyncDriverFactoryOptions;
    }
    case MessageQueueDriverType.PgBoss: {
      const connectionString = twentyConfigService.get('PG_DATABASE_URL');

      return {
        type: MessageQueueDriverType.PgBoss,
        options: {
          connectionString,
        },
      } satisfies PgBossDriverFactoryOptions;
    }*/
    case MessageQueueDriverType.BullMQ: {
      return {
        type: MessageQueueDriverType.BullMQ,
        options: {
          connection: redisClientService.getClient(),
        },
      } satisfies BullMQDriverFactoryOptions;
    }
    default:
      throw new Error(
        `Invalid message queue driver type (${driverType}), check your .env file`,
      );
  }
};
