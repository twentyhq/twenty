import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicatorStatus } from '@nestjs/terminus';

import { HEALTH_INDICATORS } from 'src/engine/core-modules/admin-panel/constants/health-indicators.constants';
import { AdminPanelHealthServiceData } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-health-service-data.dto';
import { SystemHealth } from 'src/engine/core-modules/admin-panel/dtos/system-health.dto';
import { AdminPanelHealthServiceStatus } from 'src/engine/core-modules/admin-panel/enums/admin-panel-health-service-status.enum';
import { HealthIndicatorId } from 'src/engine/core-modules/health/enums/health-indicator-id.enum';
import { ConnectedAccountHealth } from 'src/engine/core-modules/health/indicators/connected-account.health';
import { DatabaseHealthIndicator } from 'src/engine/core-modules/health/indicators/database.health';
import { RedisHealthIndicator } from 'src/engine/core-modules/health/indicators/redis.health';
import { WorkerHealthIndicator } from 'src/engine/core-modules/health/indicators/worker.health';

@Injectable()
export class AdminPanelHealthService {
  constructor(
    private readonly databaseHealth: DatabaseHealthIndicator,
    private readonly redisHealth: RedisHealthIndicator,
    private readonly workerHealth: WorkerHealthIndicator,
    private readonly connectedAccountHealth: ConnectedAccountHealth,
  ) {}

  private readonly healthIndicators = {
    [HealthIndicatorId.database]: this.databaseHealth,
    [HealthIndicatorId.redis]: this.redisHealth,
    [HealthIndicatorId.worker]: this.workerHealth,
    [HealthIndicatorId.connectedAccount]: this.connectedAccountHealth,
  };

  private transformStatus(status: HealthIndicatorStatus) {
    return status === 'up'
      ? AdminPanelHealthServiceStatus.OPERATIONAL
      : AdminPanelHealthServiceStatus.OUTAGE;
  }

  private transformServiceDetails(details: any) {
    if (!details) return details;

    if (details.messageSync) {
      details.messageSync.status = this.transformStatus(
        details.messageSync.status,
      );
    }
    if (details.calendarSync) {
      details.calendarSync.status = this.transformStatus(
        details.calendarSync.status,
      );
    }

    return details;
  }

  private getServiceStatus(
    result: PromiseSettledResult<HealthIndicatorResult>,
    indicatorId: HealthIndicatorId,
  ) {
    if (result.status === 'fulfilled') {
      const key = Object.keys(result.value)[0];
      const serviceResult = result.value[key];
      const details = this.transformServiceDetails(serviceResult.details);
      const indicator = HEALTH_INDICATORS[indicatorId];

      return {
        id: indicatorId,
        label: indicator.label,
        description: indicator.description,
        status: this.transformStatus(serviceResult.status),
        details: details ? JSON.stringify(details) : undefined,
        queues: serviceResult.queues,
      };
    }

    return {
      ...HEALTH_INDICATORS[indicatorId],
      status: AdminPanelHealthServiceStatus.OUTAGE,
      details: result.reason?.message?.toString(),
    };
  }

  async getIndicatorHealthStatus(
    indicatorId: HealthIndicatorId,
  ): Promise<AdminPanelHealthServiceData> {
    const healthIndicator = this.healthIndicators[indicatorId];

    if (!healthIndicator) {
      throw new Error(`Health indicator not found: ${indicatorId}`);
    }

    const result = await Promise.allSettled([healthIndicator.isHealthy()]);
    const indicatorStatus = this.getServiceStatus(result[0], indicatorId);

    if (indicatorId === HealthIndicatorId.worker) {
      return {
        ...indicatorStatus,
        queues: (indicatorStatus?.queues ?? []).map((queue) => ({
          ...queue,
          id: `${indicatorId}-${queue.queueName}`,
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
    const [databaseResult, redisResult, workerResult, accountSyncResult] =
      await Promise.allSettled([
        this.databaseHealth.isHealthy(),
        this.redisHealth.isHealthy(),
        this.workerHealth.isHealthy(),
        this.connectedAccountHealth.isHealthy(),
      ]);

    return {
      services: [
        {
          ...HEALTH_INDICATORS[HealthIndicatorId.database],
          status: this.getServiceStatus(
            databaseResult,
            HealthIndicatorId.database,
          ).status,
        },
        {
          ...HEALTH_INDICATORS[HealthIndicatorId.redis],
          status: this.getServiceStatus(redisResult, HealthIndicatorId.redis)
            .status,
        },
        {
          ...HEALTH_INDICATORS[HealthIndicatorId.worker],
          status: this.getServiceStatus(workerResult, HealthIndicatorId.worker)
            .status,
        },
        {
          ...HEALTH_INDICATORS[HealthIndicatorId.connectedAccount],
          status: this.getServiceStatus(
            accountSyncResult,
            HealthIndicatorId.connectedAccount,
          ).status,
        },
      ],
    };
  }
}
