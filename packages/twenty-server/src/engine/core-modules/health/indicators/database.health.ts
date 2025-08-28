import { Injectable } from '@nestjs/common';
import {
  type HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { withHealthCheckTimeout } from 'src/engine/core-modules/health/utils/health-check-timeout.util';
import { HealthStateManager } from 'src/engine/core-modules/health/utils/health-state-manager.util';

@Injectable()
export class DatabaseHealthIndicator {
  private stateManager = new HealthStateManager();

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('database');

    try {
      const [
        [versionResult],
        [activeConnections],
        [maxConnections],
        [uptime],
        [databaseSize],
        tableStats,
        [cacheHitRatio],
        [deadlocks],
        [slowQueries],
      ] = await withHealthCheckTimeout(
        Promise.all([
          this.dataSource.query('SELECT version()'),
          this.dataSource.query(
            'SELECT count(*) as count FROM pg_stat_activity',
          ),
          this.dataSource.query('SHOW max_connections'),
          this.dataSource.query(
            'SELECT extract(epoch from current_timestamp - pg_postmaster_start_time()) as uptime',
          ),
          this.dataSource.query(
            'SELECT pg_size_pretty(pg_database_size(current_database())) as size',
          ),
          this.dataSource.query(`
            SELECT schemaname, relname, n_live_tup, n_dead_tup, last_vacuum, last_autovacuum 
            FROM pg_stat_user_tables 
            ORDER BY n_live_tup DESC 
            LIMIT 10
          `),
          this.dataSource.query(`
            SELECT 
              sum(heap_blks_hit) * 100.0 / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio 
            FROM pg_statio_user_tables
          `),
          this.dataSource.query(
            'SELECT deadlocks FROM pg_stat_database WHERE datname = current_database()',
          ),
          this.dataSource.query(`
            SELECT count(*) as count 
            FROM pg_stat_activity 
            WHERE state = 'active' 
            AND query_start < now() - interval '1 minute'
          `),
        ]),
        HEALTH_ERROR_MESSAGES.DATABASE_TIMEOUT,
      );

      const details = {
        system: {
          timestamp: new Date().toISOString(),
          version: versionResult.version,
          uptime: Math.round(uptime.uptime / 3600) + ' hours',
        },
        connections: {
          active: parseInt(activeConnections.count),
          max: parseInt(maxConnections.max_connections),
          utilizationPercent: Math.round(
            (parseInt(activeConnections.count) /
              parseInt(maxConnections.max_connections)) *
              100,
          ),
        },
        databaseSize: databaseSize.size,
        performance: {
          cacheHitRatio: Math.round(parseFloat(cacheHitRatio.ratio)) + '%',
          deadlocks: parseInt(deadlocks.deadlocks),
          slowQueries: parseInt(slowQueries.count),
        },
        top10Tables: tableStats,
      };

      this.stateManager.updateState(details);

      return indicator.up({ details });
    } catch (error) {
      const message =
        error.message === HEALTH_ERROR_MESSAGES.DATABASE_TIMEOUT
          ? HEALTH_ERROR_MESSAGES.DATABASE_TIMEOUT
          : HEALTH_ERROR_MESSAGES.DATABASE_CONNECTION_FAILED;

      const stateWithAge = this.stateManager.getStateWithAge();

      return indicator.down({
        message,
        details: {
          system: {
            timestamp: new Date().toISOString(),
          },
          stateHistory: stateWithAge,
        },
      });
    }
  }
}
