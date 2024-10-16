import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import {
  MessageQueueDriverType,
  MessageQueueModuleOptions,
} from 'src/engine/core-modules/message-queue/interfaces';
import IORedis from 'ioredis';

/**
 * MessageQueue Module factory
 * @returns MessageQueueModuleOptions
 * @param environmentService
 */
export const messageQueueModuleFactory = async (
  environmentService: EnvironmentService,
): Promise<MessageQueueModuleOptions> => {
  const driverType = environmentService.get('MESSAGE_QUEUE_TYPE');

  switch (driverType) {
    case MessageQueueDriverType.Sync: {
      return {
        type: MessageQueueDriverType.Sync,
        options: {},
      };
    }
    case MessageQueueDriverType.PgBoss: {
      const connectionString = environmentService.get('PG_DATABASE_URL');

      return {
        type: MessageQueueDriverType.PgBoss,
        options: {
          connectionString,
        },
      };
    }
    case MessageQueueDriverType.BullMQ: {
      const connectionString = environmentService.get('REDIS_URL');

      return {
        type: MessageQueueDriverType.BullMQ,
        options: {
          connection: new IORedis(connectionString)
        },
      };
    }
    default:
      throw new Error(
        `Invalid message queue driver type (${driverType}), check your .env file`,
      );
  }
};
