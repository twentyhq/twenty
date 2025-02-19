import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';

import { AdminPanelHealthServiceData } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-health-service-data.dto';
import { AdminPanelIndicatorHealthStatusInputEnum } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-indicator-health-status.input';
import { SystemHealth } from 'src/engine/core-modules/admin-panel/dtos/system-health.dto';
import { AdminPanelHealthServiceStatus } from 'src/engine/core-modules/admin-panel/enums/admin-panel-health-service-status.enum';
import { DatabaseHealthIndicator } from 'src/engine/core-modules/health/indicators/database.health';
import { MessageSyncHealthIndicator } from 'src/engine/core-modules/health/indicators/message-sync.health';
import { RedisHealthIndicator } from 'src/engine/core-modules/health/indicators/redis.health';
import { WorkerHealthIndicator } from 'src/engine/core-modules/health/indicators/worker.health';

@Injectable()
export class AdminPanelHealthService {
  constructor(
    private readonly databaseHealth: DatabaseHealthIndicator,
    private readonly redisHealth: RedisHealthIndicator,
    private readonly workerHealth: WorkerHealthIndicator,
    private readonly messageSyncHealth: MessageSyncHealthIndicator,
  ) {}

  private readonly healthIndicators = {
    database: this.databaseHealth,
    redis: this.redisHealth,
    worker: this.workerHealth,
    messageSync: this.messageSyncHealth,
  };

  private getServiceStatus(
    result: PromiseSettledResult<HealthIndicatorResult>,
  ) {
    if (result.status === 'fulfilled') {
      const key = Object.keys(result.value)[0];
      const serviceResult = result.value[key];
      const details = serviceResult.details;

      return {
        status:
          serviceResult.status === 'up'
            ? AdminPanelHealthServiceStatus.OPERATIONAL
            : AdminPanelHealthServiceStatus.OUTAGE,
        details: details ? JSON.stringify(details) : undefined,
        queues: serviceResult.queues,
      };
    }

    return {
      status: AdminPanelHealthServiceStatus.OUTAGE,
      details: result.reason?.message,
    };
  }

  async getIndicatorHealthStatus(
    indicatorName: AdminPanelIndicatorHealthStatusInputEnum,
  ): Promise<AdminPanelHealthServiceData> {
    const healthIndicator = this.healthIndicators[indicatorName];

    if (!healthIndicator) {
      throw new Error(`Health indicator not found: ${indicatorName}`);
    }

    const result = await Promise.allSettled([healthIndicator.isHealthy()]);
    const indicatorStatus = this.getServiceStatus(result[0]);

    if (indicatorName === 'worker') {
      return {
        ...indicatorStatus,
        queues: (indicatorStatus?.queues ?? []).map((queue) => ({
          ...queue,
          status:
            queue.workers > 0
              ? AdminPanelHealthServiceStatus.OPERATIONAL
              : AdminPanelHealthServiceStatus.OUTAGE,
        })),
      };
    }

    return indicatorStatus;
  }

  async getSystemHealthStatus(): Promise<SystemHealth> {
    const [databaseResult, redisResult, workerResult, messageSyncResult] =
      await Promise.allSettled([
        this.databaseHealth.isHealthy(),
        this.redisHealth.isHealthy(),
        this.workerHealth.isHealthy(),
        this.messageSyncHealth.isHealthy(),
      ]);

    const workerStatus = this.getServiceStatus(workerResult);

    return {
      database: this.getServiceStatus(databaseResult),
      redis: this.getServiceStatus(redisResult),
      worker: {
        ...workerStatus,
        queues: (workerStatus?.queues ?? []).map((queue) => ({
          ...queue,
          status:
            queue.workers > 0
              ? AdminPanelHealthServiceStatus.OPERATIONAL
              : AdminPanelHealthServiceStatus.OUTAGE,
        })),
      },
      messageSync: this.getServiceStatus(messageSyncResult),
    };
  }
}
