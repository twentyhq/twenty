import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { withHealthCheckTimeout } from 'src/engine/core-modules/health/utils/health-check-timeout.util';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly redisClient: RedisClientService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('redis');

    try {
      await withHealthCheckTimeout(
        this.redisClient.getClient().ping(),
        HEALTH_ERROR_MESSAGES.REDIS_TIMEOUT,
      );

      return indicator.up();
    } catch (error) {
      const errorMessage =
        error.message === HEALTH_ERROR_MESSAGES.REDIS_TIMEOUT
          ? HEALTH_ERROR_MESSAGES.REDIS_TIMEOUT
          : HEALTH_ERROR_MESSAGES.REDIS_CONNECTION_FAILED;

      return indicator.down(errorMessage);
    }
  }
}
