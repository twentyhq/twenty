import { Injectable } from '@nestjs/common';

import { type Histogram } from '@opentelemetry/api';
import { type Pool } from 'pg';
import { type DataSource } from 'typeorm';
import { type PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';

export enum DatabasePoolName {
  Core = 'core',
  WorkspacePrimary = 'workspace_primary',
  WorkspaceReplica = 'workspace_replica',
}

const ACQUISITION_DURATION_BUCKETS_SECONDS = [
  0.001, 0.0025, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10,
];

const POOL_GAUGES = [
  {
    metricName: 'twenty_database_pool_total_connections',
    description: 'Current total number of PostgreSQL pool connections',
    getValue: (pool: Pool) => pool.totalCount,
  },
  {
    metricName: 'twenty_database_pool_idle_connections',
    description: 'Current number of idle PostgreSQL pool connections',
    getValue: (pool: Pool) => pool.idleCount,
  },
  {
    metricName: 'twenty_database_pool_waiting_requests',
    description:
      'Current number of requests waiting for a PostgreSQL pool connection',
    getValue: (pool: Pool) => pool.waitingCount,
  },
  {
    metricName: 'twenty_database_pool_max_connections',
    description: 'Maximum number of PostgreSQL pool connections',
    getValue: (pool: Pool) => pool.options.max,
  },
] as const;

@Injectable()
export class DatabasePoolMetricsService {
  private readonly pools = new Map<DatabasePoolName, Pool>();
  private readonly instrumentedDrivers = new WeakSet<PostgresDriver>();
  private readonly acquisitionDurationHistogram: Histogram;

  constructor(private readonly metricsService: MetricsService) {
    this.acquisitionDurationHistogram = this.metricsService
      .getMeter()
      .createHistogram('twenty_database_pool_acquisition_duration_seconds', {
        description:
          'Time spent acquiring a connection from the PostgreSQL pool',
        unit: 's',
        advice: {
          explicitBucketBoundaries: ACQUISITION_DURATION_BUCKETS_SECONDS,
        },
      });

    for (const gauge of POOL_GAUGES) {
      this.metricsService.createMultiObservableGauge({
        metricName: gauge.metricName,
        options: {
          description: gauge.description,
        },
        callback: async () =>
          Array.from(this.pools, ([poolName, pool]) => ({
            value: gauge.getValue(pool),
            attributes: {
              pool: poolName,
            },
          })),
      });
    }
  }

  registerDataSource({
    poolName,
    dataSource,
  }: {
    poolName: DatabasePoolName;
    dataSource: DataSource;
  }): void {
    const driver = dataSource.driver as PostgresDriver;
    const pool = driver.master as Pool;

    this.pools.set(poolName, pool);

    if (this.instrumentedDrivers.has(driver)) {
      return;
    }

    const obtainMasterConnection = driver.obtainMasterConnection.bind(driver);

    driver.obtainMasterConnection = async () => {
      const start = performance.now();

      try {
        return await obtainMasterConnection();
      } finally {
        this.acquisitionDurationHistogram.record(
          (performance.now() - start) / 1000,
          {
            pool: poolName,
          },
        );
      }
    };

    this.instrumentedDrivers.add(driver);
  }
}
