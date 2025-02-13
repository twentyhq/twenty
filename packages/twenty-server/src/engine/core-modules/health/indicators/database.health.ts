import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { HEALTH_INDICATORS_TIMEOUT } from 'src/engine/core-modules/health/constants/health-indicators-timeout.conts';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(
    @InjectDataSource('core')
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await Promise.race([
        this.dataSource.query('SELECT 1'),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(HEALTH_ERROR_MESSAGES.DATABASE_TIMEOUT)),
            HEALTH_INDICATORS_TIMEOUT,
          ),
        ),
      ]);

      return this.getStatus(key, true);
    } catch (error) {
      return this.getStatus(key, false, {
        error:
          error.message || HEALTH_ERROR_MESSAGES.DATABASE_CONNECTION_FAILED,
      });
    }
  }
}
