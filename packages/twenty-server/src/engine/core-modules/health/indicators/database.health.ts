import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { withHealthCheckTimeout } from 'src/engine/core-modules/health/utils/health-check-timeout.util';

@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    @InjectDataSource('core')
    private readonly dataSource: DataSource,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('database');

    try {
      await withHealthCheckTimeout(
        this.dataSource.query('SELECT 1'),
        HEALTH_ERROR_MESSAGES.DATABASE_TIMEOUT,
      );

      return indicator.up();
    } catch (error) {
      const errorMessage =
        error.message === HEALTH_ERROR_MESSAGES.DATABASE_TIMEOUT
          ? HEALTH_ERROR_MESSAGES.DATABASE_TIMEOUT
          : HEALTH_ERROR_MESSAGES.DATABASE_CONNECTION_FAILED;

      return indicator.down(errorMessage);
    }
  }
}
