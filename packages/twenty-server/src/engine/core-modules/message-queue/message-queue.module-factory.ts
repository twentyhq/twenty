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
  const driverType = MessageQueueDriverType.BULL_MQ;

  switch (driverType) {
    case MessageQueueDriverType.BULL_MQ: {
      return {
        type: MessageQueueDriverType.BULL_MQ,
        options: {
          connection: redisClientService.getQueueClient(),
        },
      } satisfies BullMQDriverFactoryOptions;
    }
    default:
      throw new Error(
        `Invalid message queue driver type (${driverType}), check your .env file`,
      );
  }
};
