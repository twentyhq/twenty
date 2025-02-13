import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { withHealthCheckTimeout } from 'src/engine/core-modules/health/utils/health-check-timeout.util';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(
    @InjectDataSource('core')
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      await withHealthCheckTimeout(
        this.dataSource.query('SELECT 1'),
        HEALTH_ERROR_MESSAGES.DATABASE_TIMEOUT,
      );

      return this.getStatus('database', true);
    } catch (error) {
      return this.getStatus('database', false, {
        error:
          error.message || HEALTH_ERROR_MESSAGES.DATABASE_CONNECTION_FAILED,
      });
    }
  }
}
