import { Injectable } from '@nestjs/common';
import { HealthCheckService } from '@nestjs/terminus';

import { SystemHealth } from 'src/engine/core-modules/admin-panel/dtos/systen-health.dto';
import { HealthServiceName } from 'src/engine/core-modules/health/enums/health-service-name.enum';
import { HealthServiceStatus } from 'src/engine/core-modules/health/enums/health-service-status.enum';
import { HealthCacheService } from 'src/engine/core-modules/health/health-cache.service';
import { DatabaseHealthIndicator } from 'src/engine/core-modules/health/indicators/database.health';
import { RedisHealthIndicator } from 'src/engine/core-modules/health/indicators/redis.health';
import { WorkerHealthIndicator } from 'src/engine/core-modules/health/indicators/worker.health';

@Injectable()
export class AdminPanelHealthService {
  constructor(
    private readonly health: HealthCheckService,
    private readonly databaseHealth: DatabaseHealthIndicator,
    private readonly redisHealth: RedisHealthIndicator,
    private readonly workerHealth: WorkerHealthIndicator,
    private readonly healthCacheService: HealthCacheService,
  ) {}

  async getSystemHealthStatus(): Promise<SystemHealth> {
    const [healthCheck, messageSync] = await Promise.all([
      this.health.check([
        () => this.databaseHealth.isHealthy(),
        () => this.redisHealth.isHealthy(),
        () => this.workerHealth.isHealthy(),
      ]),
      this.healthCacheService.getMessageChannelSyncJobByStatusCounter(),
    ]);

    return {
      [HealthServiceName.DATABASE]: {
        status:
          healthCheck.info?.database?.status === 'up'
            ? HealthServiceStatus.OPERATIONAL
            : HealthServiceStatus.OUTAGE,
      },
      [HealthServiceName.REDIS]: {
        status:
          healthCheck.info?.redis?.status === 'up'
            ? HealthServiceStatus.OPERATIONAL
            : HealthServiceStatus.OUTAGE,
      },
      [HealthServiceName.WORKER]: {
        status:
          healthCheck.info?.worker?.status === 'up'
            ? HealthServiceStatus.OPERATIONAL
            : HealthServiceStatus.OUTAGE,
      },
      messageSync,
    };
  }
}
