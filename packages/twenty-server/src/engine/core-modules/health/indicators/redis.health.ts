import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';

import { HEALTH_INDICATORS_TIMEOUT } from 'src/engine/core-modules/health/constants/health-indicators-timeout.conts';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redisClient: RedisClientService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await Promise.race([
        this.redisClient.getClient().ping(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Redis timeout')),
            HEALTH_INDICATORS_TIMEOUT,
          ),
        ),
      ]);

      return this.getStatus(key, true);
    } catch (error) {
      return this.getStatus(key, false, {
        error: error?.message ?? 'Unknown Redis error',
      });
    }
  }
}
