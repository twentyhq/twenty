import { Injectable } from '@nestjs/common';
import {
  type HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { withHealthCheckTimeout } from 'src/engine/core-modules/health/utils/health-check-timeout.util';
import { HealthStateManager } from 'src/engine/core-modules/health/utils/health-state-manager.util';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

@Injectable()
export class RedisHealthIndicator {
  private stateManager = new HealthStateManager();

  constructor(
    private readonly redisClient: RedisClientService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('redis');

    try {
      const [info, memory, clients, stats] = await withHealthCheckTimeout(
        Promise.all([
          this.redisClient.getClient().info(),
          this.redisClient.getClient().info('memory'),
          this.redisClient.getClient().info('clients'),
          this.redisClient.getClient().info('stats'),
        ]),
        HEALTH_ERROR_MESSAGES.REDIS_TIMEOUT,
      );

      const parseInfo = (info: string) => {
        const result: Record<string, string> = {};

        info.split('\r\n').forEach((line) => {
          const [key, value] = line.split(':');

          if (key && value) {
            result[key] = value;
          }
        });

        return result;
      };

      const infoData = parseInfo(info);
      const memoryData = parseInfo(memory);
      const clientsData = parseInfo(clients);
      const statsData = parseInfo(stats);

      const details = {
        system: {
          timestamp: new Date().toISOString(),
          version: infoData.redis_version,
          uptime:
            Math.round(parseInt(infoData.uptime_in_seconds) / 3600) + ' hours',
        },
        memory: {
          used: memoryData.used_memory_human,
          peak: memoryData.used_memory_peak_human,
          fragmentation: parseFloat(memoryData.mem_fragmentation_ratio),
        },
        connections: {
          current: parseInt(clientsData.connected_clients),
          total: parseInt(statsData.total_connections_received),
          rejected: parseInt(statsData.rejected_connections),
        },
        performance: {
          opsPerSecond: parseInt(statsData.instantaneous_ops_per_sec),
          hitRate: statsData.keyspace_hits
            ? Math.round(
                (parseInt(statsData.keyspace_hits) /
                  (parseInt(statsData.keyspace_hits) +
                    parseInt(statsData.keyspace_misses))) *
                  100,
              ) + '%'
            : '0%',
          evictedKeys: parseInt(statsData.evicted_keys),
          expiredKeys: parseInt(statsData.expired_keys),
        },
        replication: {
          role: infoData.role,
          connectedSlaves: parseInt(infoData.connected_slaves || '0'),
        },
      };

      this.stateManager.updateState(details);

      return indicator.up({ details });
    } catch (error) {
      const message =
        error.message === HEALTH_ERROR_MESSAGES.REDIS_TIMEOUT
          ? HEALTH_ERROR_MESSAGES.REDIS_TIMEOUT
          : HEALTH_ERROR_MESSAGES.REDIS_CONNECTION_FAILED;

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
