import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import {
  MessageQueueDriverType,
  MessageQueueModuleOptions,
} from 'src/engine/core-modules/message-queue/interfaces';

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
      const host = environmentService.get('REDIS_HOST');
      const port = environmentService.get('REDIS_PORT');
      const username = environmentService.get('REDIS_USERNAME');
      const password = environmentService.get('REDIS_PASSWORD');

      return {
        type: MessageQueueDriverType.BullMQ,
        options: {
          connection: {
            host,
            port,
            username,
            password,
          },
        },
      };
    }
    default:
      throw new Error(
        `Invalid message queue driver type (${driverType}), check your .env file`,
      );
  }
};
