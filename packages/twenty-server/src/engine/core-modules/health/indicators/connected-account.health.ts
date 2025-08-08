import { Injectable } from '@nestjs/common';
import {
  type HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { METRICS_FAILURE_RATE_THRESHOLD } from 'src/engine/core-modules/health/constants/metrics-failure-rate-threshold.const';
import { withHealthCheckTimeout } from 'src/engine/core-modules/health/utils/health-check-timeout.util';
import {
  CALENDAR_SYNC_METRICS_BY_STATUS,
  MESSAGE_SYNC_METRICS_BY_STATUS,
} from 'src/engine/core-modules/metrics/constants/account-sync-metrics-by-status.constant';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
@Injectable()
export class ConnectedAccountHealth {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly metricsService: MetricsService,
  ) {}

  private async checkMessageSyncHealth(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('messageSync');

    try {
      const counters = await withHealthCheckTimeout(
        this.metricsService.groupMetrics(MESSAGE_SYNC_METRICS_BY_STATUS),
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

      if (totalJobs === 0 || failureRate < METRICS_FAILURE_RATE_THRESHOLD) {
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

      return indicator.down({
        error: errorMessage,
        details: {},
      });
    }
  }

  private async checkCalendarSyncHealth(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('calendarSync');

    try {
      const counters = await withHealthCheckTimeout(
        this.metricsService.groupMetrics(CALENDAR_SYNC_METRICS_BY_STATUS),
        HEALTH_ERROR_MESSAGES.CALENDAR_SYNC_TIMEOUT,
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

      if (totalJobs === 0 || failureRate < METRICS_FAILURE_RATE_THRESHOLD) {
        return indicator.up({ details });
      }

      return indicator.down({
        error: HEALTH_ERROR_MESSAGES.CALENDAR_SYNC_HIGH_FAILURE_RATE,
        details,
      });
    } catch (error) {
      const errorMessage =
        error.message === HEALTH_ERROR_MESSAGES.CALENDAR_SYNC_TIMEOUT
          ? HEALTH_ERROR_MESSAGES.CALENDAR_SYNC_TIMEOUT
          : HEALTH_ERROR_MESSAGES.CALENDAR_SYNC_CHECK_FAILED;

      return indicator.down({
        error: errorMessage,
        details: {},
      });
    }
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('connectedAccount');

    const [messageResult, calendarResult] = await Promise.all([
      this.checkMessageSyncHealth(),
      this.checkCalendarSyncHealth(),
    ]);

    const isMessageSyncDown = messageResult.messageSync.status === 'down';
    const isCalendarSyncDown = calendarResult.calendarSync.status === 'down';

    if (isMessageSyncDown || isCalendarSyncDown) {
      let error: string;

      if (isMessageSyncDown && isCalendarSyncDown) {
        error = `${messageResult.messageSync.error} and ${calendarResult.calendarSync.error}`;
      } else if (isMessageSyncDown) {
        error = messageResult.messageSync.error;
      } else {
        error = calendarResult.calendarSync.error;
      }

      return indicator.down({
        error,
        details: {
          messageSync: messageResult.messageSync,
          calendarSync: calendarResult.calendarSync,
        },
      });
    }

    return indicator.up({
      details: {
        messageSync: messageResult.messageSync,
        calendarSync: calendarResult.calendarSync,
      },
    });
  }
}
