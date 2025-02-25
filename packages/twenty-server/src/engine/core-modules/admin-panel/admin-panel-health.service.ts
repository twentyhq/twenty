import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicatorStatus } from '@nestjs/terminus';

import { Metrics, Queue } from 'bullmq';
import { format } from 'date-fns';

import { HEALTH_INDICATORS } from 'src/engine/core-modules/admin-panel/constants/health-indicators.constants';
import { AdminPanelHealthServiceData } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-health-service-data.dto';
import { SystemHealth } from 'src/engine/core-modules/admin-panel/dtos/system-health.dto';
import { WorkerMetricsData } from 'src/engine/core-modules/admin-panel/dtos/worker-metrics-data.dto';
import { AdminPanelHealthServiceStatus } from 'src/engine/core-modules/admin-panel/enums/admin-panel-health-service-status.enum';
import { HealthIndicatorId } from 'src/engine/core-modules/health/enums/health-indicator-id.enum';
import { ConnectedAccountHealth } from 'src/engine/core-modules/health/indicators/connected-account.health';
import { DatabaseHealthIndicator } from 'src/engine/core-modules/health/indicators/database.health';
import { RedisHealthIndicator } from 'src/engine/core-modules/health/indicators/redis.health';
import { WorkerHealthIndicator } from 'src/engine/core-modules/health/indicators/worker.health';
import { WorkerQueueHealth } from 'src/engine/core-modules/health/types/worker-queue-health.type';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

@Injectable()
export class AdminPanelHealthService {
  private readonly logger = new Logger(AdminPanelHealthService.name);

  constructor(
    private readonly databaseHealth: DatabaseHealthIndicator,
    private readonly redisHealth: RedisHealthIndicator,
    private readonly workerHealth: WorkerHealthIndicator,
    private readonly connectedAccountHealth: ConnectedAccountHealth,
    private readonly redisClient: RedisClientService,
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

  async getQueueMetricsOverTime(
    queueName: MessageQueue,
    timeRange: '7D' | '1D' | '12H' | '4H',
  ): Promise<WorkerMetricsData> {
    const redis = this.redisClient.getClient();
    const queue = new Queue(queueName, { connection: redis });

    try {
      const queueDetails = await this.workerHealth.getQueueDetails(queueName);
      const { pointsNeeded, intervalMinutes } =
        this.getMetricsParameters(timeRange);

      const [completedMetricsObj, failedMetricsObj] = await Promise.all([
        queue.getMetrics('completed', 0, pointsNeeded - 1),
        queue.getMetrics('failed', 0, pointsNeeded - 1),
      ]);

      const completedMetrics = this.extractBullMQMetrics(
        completedMetricsObj,
        intervalMinutes,
        pointsNeeded,
      );
      const failedMetrics = this.extractBullMQMetrics(
        failedMetricsObj,
        intervalMinutes,
        pointsNeeded,
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

  private getMetricsParameters(timeRange: '7D' | '1D' | '12H' | '4H'): {
    pointsNeeded: number;
    intervalMinutes: number;
  } {
    switch (timeRange) {
      case '4H':
        return { pointsNeeded: 48, intervalMinutes: 5 };
      case '12H':
        return { pointsNeeded: 48, intervalMinutes: 15 };
      case '1D':
        return { pointsNeeded: 48, intervalMinutes: 30 };
      case '7D':
        return { pointsNeeded: 48, intervalMinutes: 210 };
      default:
        return { pointsNeeded: 60, intervalMinutes: 1 };
    }
  }

  private extractBullMQMetrics(
    metrics: Metrics,
    intervalMinutes: number,
    maxPoints: number,
  ): { timestamp: number; count: number }[] {
    if (!metrics || !metrics.data || !Array.isArray(metrics.data)) {
      return this.generateEmptyTimeSeriesPoints(intervalMinutes, maxPoints);
    }

    try {
      const now = Date.now();
      const totalTimeSpanMs = intervalMinutes * maxPoints * 60 * 1000;
      const availablePoints = metrics.data.length;

      if (availablePoints <= 1) {
        const singlePointValue =
          availablePoints === 1
            ? typeof metrics.data[0] === 'number'
              ? metrics.data[0]
              : parseInt(metrics.data[0] as unknown as string, 10) || 0
            : 0;

        return this.generateEmptyTimeSeriesPoints(
          intervalMinutes,
          maxPoints,
          singlePointValue,
        );
      }

      const actualPoints = Math.min(availablePoints, maxPoints);
      const result: { timestamp: number; count: number }[] = [];

      for (let i = 0; i < actualPoints; i++) {
        const timeOffset = (i / (actualPoints - 1)) * totalTimeSpanMs;
        const timestamp = now - timeOffset;
        const dataIndex = Math.min(i, availablePoints - 1);

        let count = 0;

        try {
          const rawCount = metrics.data[dataIndex];

          count =
            typeof rawCount === 'number'
              ? rawCount
              : parseInt(rawCount as unknown as string, 10) || 0;
        } catch (err) {
          this.logger.warn(`Error parsing metrics count: ${err.message}`);
        }

        result.push({ timestamp, count });
      }

      return result;
    } catch (error) {
      this.logger.error(`Error extracting BullMQ metrics: ${error.message}`);
      throw error;
    }
  }

  private generateEmptyTimeSeriesPoints(
    intervalMinutes: number,
    numPoints: number,
    currentPointValue = 0,
  ): { timestamp: number; count: number }[] {
    const now = Date.now();
    const totalTimeSpanMs = intervalMinutes * numPoints * 60 * 1000;
    const result: { timestamp: number; count: number }[] = [];

    for (let i = 0; i < numPoints; i++) {
      const timeOffset = i === 0 ? 0 : (i / (numPoints - 1)) * totalTimeSpanMs;
      const timestamp = now - timeOffset;

      const count = i === 0 ? currentPointValue : 0;

      result.push({ timestamp, count });
    }

    return result;
  }

  private transformMetricsForGraph(
    completedMetrics: { timestamp: number; count: number }[],
    failedMetrics: { timestamp: number; count: number }[],
    timeRange: '7D' | '1D' | '12H' | '4H',
    queueName: MessageQueue,
    queueDetails: WorkerQueueHealth | null,
  ): WorkerMetricsData {
    try {
      const timestampMap = new Map<
        number,
        { timestamp: number; completed: number; failed: number }
      >();

      completedMetrics.forEach((metric) => {
        timestampMap.set(metric.timestamp, {
          timestamp: metric.timestamp,
          completed: metric.count,
          failed: 0,
        });
      });

      failedMetrics.forEach((metric) => {
        if (timestampMap.has(metric.timestamp)) {
          const existing = timestampMap.get(metric.timestamp);

          if (existing) {
            existing.failed = metric.count;
          }
        } else {
          timestampMap.set(metric.timestamp, {
            timestamp: metric.timestamp,
            completed: 0,
            failed: metric.count,
          });
        }
      });

      const dataPoints = Array.from(timestampMap.values()).sort(
        (a, b) => a.timestamp - b.timestamp,
      );

      const formatForNivo = (timestamp: number): string => {
        try {
          const date = new Date(timestamp);

          if (isNaN(date.getTime())) {
            this.logger.warn(`Invalid timestamp: ${timestamp}`);
            throw new Error(`Invalid timestamp: ${timestamp}`);
          }

          return format(date, 'yyyy-MM-dd HH:mm:ss');
        } catch (error) {
          this.logger.error(`Error formatting date: ${error.message}`);
          throw error;
        }
      };

      return {
        queueName,
        timeRange,
        details: JSON.stringify(queueDetails),
        data: [
          {
            id: 'Completed Jobs',
            data: dataPoints.map((point) => ({
              x: formatForNivo(point.timestamp),
              y: point.completed,
            })),
          },
          {
            id: 'Failed Jobs',
            data: dataPoints.map((point) => ({
              x: formatForNivo(point.timestamp),
              y: point.failed,
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
