import { Injectable, type OnModuleDestroy } from '@nestjs/common';

import IORedis from 'ioredis';
import { isDefined } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class RedisClientService implements OnModuleDestroy {
  private redisClient: IORedis | null = null;
  private redisQueueClient: IORedis | null = null;

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  getQueueClient() {
    if (!this.redisQueueClient) {
      const redisQueueUrl = this.twentyConfigService.get('REDIS_QUEUE_URL');

      this.redisQueueClient = redisQueueUrl
        ? new IORedis(redisQueueUrl, {
            maxRetriesPerRequest: null,
          })
        : this.getClient();
    }

    return this.redisQueueClient;
  }

  getClient() {
    if (!this.redisClient) {
      const redisUrl = this.twentyConfigService.get('REDIS_URL');

      if (!redisUrl) {
        throw new Error('REDIS_URL must be defined');
      }

      this.redisClient = new IORedis(redisUrl, {
        maxRetriesPerRequest: null,
      });
    }

    return this.redisClient;
  }

  async onModuleDestroy() {
    if (isDefined(this.redisClient) && this.redisClient.status !== 'end') {
      await this.redisClient.quit();
    }
    if (
      isDefined(this.redisQueueClient) &&
      this.redisQueueClient.status !== 'end'
    ) {
      await this.redisQueueClient.quit();
    }
    this.redisClient = null;
    this.redisQueueClient = null;
  }
}
