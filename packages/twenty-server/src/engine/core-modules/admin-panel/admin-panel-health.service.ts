import { Injectable } from '@nestjs/common';
import { HealthCheckService } from '@nestjs/terminus';

import { SystemHealth } from 'src/engine/core-modules/admin-panel/dtos/system-health.dto';
import { AdminPanelHealthServiceStatus } from 'src/engine/core-modules/admin-panel/enums/admin-panel-health-service-status.enum';
import { HealthServiceName } from 'src/engine/core-modules/health/enums/health-service-name.enum';
import { DatabaseHealthIndicator } from 'src/engine/core-modules/health/indicators/database.health';
import { MessageSyncHealthIndicator } from 'src/engine/core-modules/health/indicators/message-sync.health';
import { RedisHealthIndicator } from 'src/engine/core-modules/health/indicators/redis.health';
import { WorkerHealthIndicator } from 'src/engine/core-modules/health/indicators/worker.health';

@Injectable()
export class AdminPanelHealthService {
  constructor(
    private readonly health: HealthCheckService,
    private readonly databaseHealth: DatabaseHealthIndicator,
    private readonly redisHealth: RedisHealthIndicator,
    private readonly workerHealth: WorkerHealthIndicator,
    private readonly messageSyncHealth: MessageSyncHealthIndicator,
  ) {}

  async getSystemHealthStatus(): Promise<SystemHealth> {
    const [healthCheck] = await Promise.all([
      this.health.check([
        () => this.databaseHealth.isHealthy(),
        () => this.redisHealth.isHealthy(),
        () => this.workerHealth.isHealthy(),
        () => this.messageSyncHealth.isHealthy(),
      ]),
    ]);

    const mapHealthStatus = (status: string) =>
      status === 'up'
        ? AdminPanelHealthServiceStatus.OPERATIONAL
        : AdminPanelHealthServiceStatus.OUTAGE;

    const healthServices = {
      [HealthServiceName.DATABASE]: {
        status: mapHealthStatus(healthCheck.info?.database?.status ?? 'down'),
        details: JSON.stringify(healthCheck.info?.database?.details),
      },
      [HealthServiceName.REDIS]: {
        status: mapHealthStatus(healthCheck.info?.redis?.status ?? 'down'),
        details: JSON.stringify(healthCheck.info?.redis?.details),
      },
      [HealthServiceName.WORKER]: {
        status: mapHealthStatus(healthCheck.info?.worker?.status ?? 'down'),
        queues: (healthCheck.info?.worker?.queues ?? []).map((queue) => ({
          ...queue,
          status:
            queue.workers > 0
              ? AdminPanelHealthServiceStatus.OPERATIONAL
              : AdminPanelHealthServiceStatus.OUTAGE,
        })),
      },
      [HealthServiceName.MESSAGE_SYNC]: {
        status: mapHealthStatus(
          healthCheck.info?.messageSync?.status ?? 'down',
        ),
        details: JSON.stringify(healthCheck.info?.messageSync?.details),
      },
    };

    return healthServices;
  }
}
