import { Injectable, Logger } from '@nestjs/common';
import {
  type HealthIndicatorResult,
  type HealthIndicatorStatus,
} from '@nestjs/terminus';

import { Queue } from 'bullmq';

import { HEALTH_INDICATORS } from 'src/engine/core-modules/admin-panel/constants/health-indicators.constants';
import { type AdminPanelHealthServiceDataDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-health-service-data.dto';
import { type QueueMetricsDataDTO } from 'src/engine/core-modules/admin-panel/dtos/queue-metrics-data.dto';
import { type SystemHealthDTO } from 'src/engine/core-modules/admin-panel/dtos/system-health.dto';
import { AdminPanelHealthServiceStatus } from 'src/engine/core-modules/admin-panel/enums/admin-panel-health-service-status.enum';
import { QueueMetricsTimeRange } from 'src/engine/core-modules/admin-panel/enums/queue-metrics-time-range.enum';
import { HealthIndicatorId } from 'src/engine/core-modules/health/enums/health-indicator-id.enum';
import { AppHealthIndicator } from 'src/engine/core-modules/health/indicators/app.health';
import { ConnectedAccountHealth } from 'src/engine/core-modules/health/indicators/connected-account.health';
import { DatabaseHealthIndicator } from 'src/engine/core-modules/health/indicators/database.health';
import { RedisHealthIndicator } from 'src/engine/core-modules/health/indicators/redis.health';
import { WorkerHealthIndicator } from 'src/engine/core-modules/health/indicators/worker.health';
import { type WorkerQueueHealth } from 'src/engine/core-modules/health/types/worker-queue-health.type';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

@Injectable()
export class AdminPanelHealthService {
  private readonly logger = new Logger(AdminPanelHealthService.name);

  constructor(
    private readonly databaseHealth: DatabaseHealthIndicator,
    private readonly redisHealth: RedisHealthIndicator,
    private readonly workerHealth: WorkerHealthIndicator,
    private readonly connectedAccountHealth: ConnectedAccountHealth,
    private readonly appHealth: AppHealthIndicator,
    private readonly redisClient: RedisClientService,
  ) {}

  private readonly healthIndicators = {
    [HealthIndicatorId.database]: this.databaseHealth,
    [HealthIndicatorId.redis]: this.redisHealth,
    [HealthIndicatorId.worker]: this.workerHealth,
    [HealthIndicatorId.connectedAccount]: this.connectedAccountHealth,
    [HealthIndicatorId.app]: this.appHealth,
  };

  private transformStatus(status: HealthIndicatorStatus) {
    return status === 'up'
      ? AdminPanelHealthServiceStatus.OPERATIONAL
      : AdminPanelHealthServiceStatus.OUTAGE;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformServiceDetails(details: any) {
    if (!details) return details;

    if (details.details) {
      if (details.details.messageSync) {
        details.details.messageSync.status = this.transformStatus(
          details.details.messageSync.status,
        );
      }
      if (details.details.calendarSync) {
        details.details.calendarSync.status = this.transformStatus(
          details.details.calendarSync.status,
        );
      }
    }

    return details;
  }

  private getServiceStatus(
    result: PromiseSettledResult<HealthIndicatorResult>,
    indicatorId: HealthIndicatorId,
  ) {
    if (result.status === 'fulfilled') {
      const keys = Object.keys(result.value);

      if (keys.length === 0) {
        return {
          ...HEALTH_INDICATORS[indicatorId],
          status: AdminPanelHealthServiceStatus.OUTAGE,
          errorMessage: 'No health check result available',
        };
      }
      const key = keys[0];
      const serviceResult = result.value[key];
      const { status, message, ...detailsWithoutStatus } = serviceResult;
      const indicator = HEALTH_INDICATORS[indicatorId];

      const transformedDetails =
        this.transformServiceDetails(detailsWithoutStatus);

      return {
        id: indicatorId,
        label: indicator.label,
        description: indicator.description,
        status: this.transformStatus(status),
        errorMessage: message,
        details:
          Object.keys(transformedDetails).length > 0
            ? JSON.stringify(transformedDetails)
            : undefined,
        queues: serviceResult.queues,
      };
    }

    return {
      ...HEALTH_INDICATORS[indicatorId],
      status: AdminPanelHealthServiceStatus.OUTAGE,
      errorMessage: result.reason?.message?.toString(),
      details: result.reason?.details
        ? JSON.stringify(result.reason.details)
        : undefined,
    };
  }

  async getIndicatorHealthStatus(
    indicatorId: HealthIndicatorId,
  ): Promise<AdminPanelHealthServiceDataDTO> {
    const healthIndicator = this.healthIndicators[indicatorId];

    if (!healthIndicator) {
      throw new Error(`Health indicator not found: ${indicatorId}`);
    }

    const result = await Promise.allSettled([healthIndicator.isHealthy()]);
    const indicatorStatus = this.getServiceStatus(result[0], indicatorId);

    if (indicatorId === HealthIndicatorId.worker) {
      return {
        ...indicatorStatus,
        // @ts-expect-error legacy noImplicitAny
        queues: (indicatorStatus?.queues ?? []).map((queue) => ({
          id: `${indicatorId}-${queue.queueName}`,
          queueName: queue.queueName,
          status:
            queue.workers > 0
              ? AdminPanelHealthServiceStatus.OPERATIONAL
              : AdminPanelHealthServiceStatus.OUTAGE,
        })),
      };
    }

    return indicatorStatus;
  }

  async getSystemHealthStatus(): Promise<SystemHealthDTO> {
    const [
      databaseResult,
      redisResult,
      workerResult,
      accountSyncResult,
      appResult,
    ] = await Promise.allSettled([
      this.databaseHealth.isHealthy(),
      this.redisHealth.isHealthy(),
      this.workerHealth.isHealthy(),
      this.connectedAccountHealth.isHealthy(),
      this.appHealth.isHealthy(),
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
        {
          ...HEALTH_INDICATORS[HealthIndicatorId.app],
          status: this.getServiceStatus(appResult, HealthIndicatorId.app)
            .status,
        },
      ],
    };
  }

  async getQueueMetrics(
    queueName: MessageQueue,
    timeRange: QueueMetricsTimeRange = QueueMetricsTimeRange.OneDay,
  ): Promise<QueueMetricsDataDTO> {
    const redis = this.redisClient.getQueueClient();
    const queue = new Queue(queueName, { connection: redis });

    try {
      const { pointsNeeded, samplingFactor } =
        this.getPointsConfiguration(timeRange);

      const queueDetails = await this.workerHealth.getQueueDetails(queueName, {
        pointsNeeded,
      });

      const completedMetricsArray = queueDetails?.metrics?.completedData;
      const failedMetricsArray = queueDetails?.metrics?.failedData;

      const completedMetrics = this.extractMetricsData(
        completedMetricsArray,
        pointsNeeded,
        samplingFactor,
      );

      const failedMetrics = this.extractMetricsData(
        failedMetricsArray,
        pointsNeeded,
        samplingFactor,
      );

      return this.transformMetricsForGraph(
        completedMetrics,
        failedMetrics,
        timeRange,
        queueName,
        queueDetails,
      );
    } catch (error) {
      this.logger.error(
        `Error getting metrics for ${queueName}: ${error.message}`,
      );
      throw error;
    } finally {
      await queue.close();
    }
  }

  private getPointsConfiguration(timeRange: QueueMetricsTimeRange): {
    pointsNeeded: number;
    samplingFactor: number;
    targetVisualizationPoints: number;
  } {
    const targetVisualizationPoints = 240;

    let pointsNeeded: number;

    switch (timeRange) {
      case QueueMetricsTimeRange.OneHour:
        pointsNeeded = 60; // 60 points (1 hour)
        break;
      case QueueMetricsTimeRange.FourHours:
        pointsNeeded = 4 * 60; // 240 points (4 hours)
        break;
      case QueueMetricsTimeRange.TwelveHours:
        pointsNeeded = 12 * 60; // 720 points (12 hours)
        break;
      case QueueMetricsTimeRange.OneDay:
        pointsNeeded = 24 * 60; // 1440 points (24 hours)
        break;
      case QueueMetricsTimeRange.SevenDays:
        pointsNeeded = 7 * 24 * 60; // 10080 points (7 days)
        break;

      default:
        pointsNeeded = 24 * 60; // Default to 1 day
    }

    const samplingFactor =
      pointsNeeded <= targetVisualizationPoints
        ? 1
        : Math.ceil(pointsNeeded / targetVisualizationPoints);

    return {
      pointsNeeded,
      samplingFactor,
      targetVisualizationPoints,
    };
  }

  private extractMetricsData(
    metrics: number[] | undefined,
    pointsNeeded: number,
    samplingFactor = 1,
  ): number[] {
    if (!metrics || !Array.isArray(metrics)) {
      return Array(Math.ceil(pointsNeeded / samplingFactor)).fill(0);
    }

    try {
      const targetPoints = Math.ceil(pointsNeeded / samplingFactor);

      const relevantData = metrics.slice(-pointsNeeded);
      const result: number[] = [];

      const backfillCount = Math.max(
        0,
        targetPoints - Math.ceil(relevantData.length / samplingFactor),
      );

      result.push(...Array(backfillCount).fill(0));

      for (let i = 0; i < relevantData.length; i += samplingFactor) {
        const chunk = relevantData.slice(i, i + samplingFactor);

        result.push(Math.max(...chunk));
      }

      return result.slice(0, targetPoints);
    } catch (error) {
      this.logger.error(`Error extracting metrics data: ${error.message}`);
      throw error;
    }
  }

  private transformMetricsForGraph(
    completedMetrics: number[],
    failedMetrics: number[],
    timeRange: QueueMetricsTimeRange,
    queueName: MessageQueue,
    queueDetails: WorkerQueueHealth | null,
  ): QueueMetricsDataDTO {
    try {
      return {
        queueName,
        timeRange,
        details: queueDetails?.metrics ?? null,
        workers: queueDetails?.workers ?? 0,
        data: [
          {
            id: 'Completed Jobs',
            data: completedMetrics.map((count, index) => ({
              x: index,
              y: count,
            })),
          },
          {
            id: 'Failed Jobs',
            data: failedMetrics.map((count, index) => ({
              x: index,
              y: count,
            })),
          },
        ],
      };
    } catch (error) {
      this.logger.error(
        `Error transforming metrics for graph: ${error.message}`,
      );
      throw error;
    }
  }
}
