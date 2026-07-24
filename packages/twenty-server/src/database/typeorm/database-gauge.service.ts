import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import {
  DatabasePoolMetricsService,
  DatabasePoolName,
} from 'src/database/typeorm/database-pool-metrics.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';

@Injectable()
export class DatabaseGaugeService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseGaugeService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly metricsService: MetricsService,
    private readonly databasePoolMetricsService: DatabasePoolMetricsService,
  ) {}

  onModuleInit() {
    this.databasePoolMetricsService.registerDataSource({
      poolName: DatabasePoolName.Core,
      dataSource: this.dataSource,
    });

    this.metricsService.createObservableGauge({
      metricName: 'twenty_database_up',
      options: {
        description: 'Whether the database is reachable (1 = up, 0 = down)',
      },
      callback: async () => {
        return this.isDatabaseUp();
      },
      cacheValue: true,
    });
  }

  private async isDatabaseUp(): Promise<number> {
    try {
      await this.dataSource.query('SELECT 1');

      return 1;
    } catch (error) {
      this.logger.error('Database health check failed', error);

      return 0;
    }
  }
}
