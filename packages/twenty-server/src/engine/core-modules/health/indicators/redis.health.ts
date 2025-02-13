import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { withHealthCheckTimeout } from 'src/engine/core-modules/health/utils/health-check-timeout.util';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redisClient: RedisClientService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      await withHealthCheckTimeout(
        this.redisClient.getClient().ping(),
        HEALTH_ERROR_MESSAGES.REDIS_TIMEOUT,
      );

      return this.getStatus('redis', true);
    } catch (error) {
      return this.getStatus('redis', false, {
        error: error?.message ?? HEALTH_ERROR_MESSAGES.REDIS_CONNECTION_FAILED,
      });
    }
  }
}
