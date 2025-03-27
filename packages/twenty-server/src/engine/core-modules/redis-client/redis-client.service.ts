import { Injectable, OnModuleDestroy } from '@nestjs/common';

import IORedis from 'ioredis';
import PubSubIORedis from 'pubsub-ioredis';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class RedisClientService implements OnModuleDestroy {
  private redisClient: IORedis | null = null;
  private pubSubRedisClient: PubSubIORedis | null = null;

  constructor(private readonly environmentService: EnvironmentService) {}

  getClient() {
    if (!this.redisClient) {
      const redisUrl = this.environmentService.get('REDIS_URL');

      if (!redisUrl) {
        throw new Error('REDIS_URL must be defined');
      }

      this.redisClient = new IORedis(redisUrl, {
        maxRetriesPerRequest: null,
      });
    }

    return this.redisClient;
  }

  getPubSubClient() {
    if (!this.pubSubRedisClient) {
      const redisUrl = this.environmentService.get('REDIS_URL');

      if (!redisUrl) {
        throw new Error('REDIS_URL must be defined');
      }

      this.pubSubRedisClient = new PubSubIORedis(redisUrl, {
        maxRetriesPerRequest: null,
      });
    }

    return this.pubSubRedisClient;
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.redisClient = null;
    }
  }
}
