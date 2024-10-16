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
      const connectionString = environmentService.get('REDIS_URL');

      if (!connectionString) {
        throw new Error(
          `${MessageQueueDriverType.BullMQ} message queue requires REDIS_URL to be defined, check your .env file`,
        );
      }

      return {
        type: MessageQueueDriverType.BullMQ,
        options: {
          connection: connectionString as any,
        },
      };
    }
    default:
      throw new Error(
        `Invalid message queue driver type (${driverType}), check your .env file`,
      );
  }
};
