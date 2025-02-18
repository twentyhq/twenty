import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { HealthCacheService } from 'src/engine/core-modules/health/health-cache.service';
import { withHealthCheckTimeout } from 'src/engine/core-modules/health/utils/health-check-timeout.util';

@Injectable()
export class MessageSyncHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly healthCacheService: HealthCacheService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('messageSync');

    try {
      const counters = await withHealthCheckTimeout(
        this.healthCacheService.getMessageChannelSyncJobByStatusCounter(),
        HEALTH_ERROR_MESSAGES.MESSAGE_SYNC_TIMEOUT,
      );

      const totalJobs = Object.values(counters).reduce(
        (sum, count) => sum + (count || 0),
        0,
      );

      const failedJobs = counters.FAILED_UNKNOWN || 0;
      //    +    (counters.FAILED_INSUFFICIENT_PERMISSIONS || 0)

      const failureRate =
        totalJobs > 0
          ? Math.round((failedJobs / totalJobs) * 100 * 100) / 100
          : 0;
      const details = {
        counters,
        totalJobs,
        failedJobs,
        failureRate,
      };

      if (totalJobs === 0 || failureRate < 20) {
        return indicator.up({ details });
      }

      return indicator.down({
        error: HEALTH_ERROR_MESSAGES.MESSAGE_SYNC_HIGH_FAILURE_RATE,
        details,
      });
    } catch (error) {
      const errorMessage =
        error.message === HEALTH_ERROR_MESSAGES.MESSAGE_SYNC_TIMEOUT
          ? HEALTH_ERROR_MESSAGES.MESSAGE_SYNC_TIMEOUT
          : HEALTH_ERROR_MESSAGES.MESSAGE_SYNC_CHECK_FAILED;

      return indicator.down(errorMessage);
    }
  }
}
