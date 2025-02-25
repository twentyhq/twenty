import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

import { Metrics, Queue } from 'bullmq';
import { format } from 'date-fns';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { METRICS_FAILURE_RATE_THRESHOLD } from 'src/engine/core-modules/health/constants/metrics-failure-rate-threshold.const';
import { WorkerMetricsData } from 'src/engine/core-modules/health/types/worker-metrics-data.types';
import { WorkerQueueHealth } from 'src/engine/core-modules/health/types/worker-queue-health.type';
import { withHealthCheckTimeout } from 'src/engine/core-modules/health/utils/health-check-timeout.util';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

@Injectable()
export class WorkerHealthIndicator {
  private readonly logger = new Logger(WorkerHealthIndicator.name);

  constructor(
    private readonly redisClient: RedisClientService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy() {
    const indicator = this.healthIndicatorService.check('worker');

    try {
      const workerStatus = await withHealthCheckTimeout(
        this.checkWorkers(),
        HEALTH_ERROR_MESSAGES.WORKER_TIMEOUT,
      );

      if (workerStatus.status === 'up') {
        return indicator.up({
          queues: workerStatus.queues,
        });
      }

      return indicator.down(workerStatus.error);
    } catch (error) {
      const errorMessage =
        error.message === HEALTH_ERROR_MESSAGES.WORKER_TIMEOUT
          ? HEALTH_ERROR_MESSAGES.WORKER_TIMEOUT
          : HEALTH_ERROR_MESSAGES.WORKER_CHECK_FAILED;

      return indicator.down(errorMessage);
    }
  }

  private async getQueueDetails(
    queueName: MessageQueue,
  ): Promise<WorkerQueueHealth | null> {
    const redis = this.redisClient.getClient();
    const queue = new Queue(queueName, { connection: redis });

    try {
      const workers = await queue.getWorkers();

      if (workers.length > 0) {
        const [
          failedMetrics,
          completedMetrics,
          waitingCount,
          activeCount,
          delayedCount,
        ] = await Promise.all([
          queue.getMetrics('failed'),
          queue.getMetrics('completed'),
          queue.getWaitingCount(),
          queue.getActiveCount(),
          queue.getDelayedCount(),
        ]);

        const totalJobs = failedMetrics.count + completedMetrics.count;
        const failureRate =
          totalJobs > 0 ? (failedMetrics.count / totalJobs) * 100 : 0;

        await queue.close();

        return {
          queueName: queueName,
          workers: workers.length,
          status:
            workers.length > 0
              ? failureRate > METRICS_FAILURE_RATE_THRESHOLD
                ? 'down'
                : 'up'
              : 'down',
          metrics: {
            failed: failedMetrics.count,
            completed: completedMetrics.count,
            waiting: waitingCount,
            active: activeCount,
            delayed: delayedCount,
            failureRate: failureRate,
          },
        };
      }

      await queue.close();

      return null;
    } catch (error) {
      this.logger.error(
        `Error getting queue details for ${queueName}: ${error.message}`,
      );
      await queue.close();
      throw error;
    }
  }

  private async checkWorkers() {
    const queues = Object.values(MessageQueue);
    const queueStatuses: WorkerQueueHealth[] = [];

    for (const queueName of queues) {
      try {
        const queueDetails = await this.getQueueDetails(queueName);

        if (queueDetails) {
          queueStatuses.push(queueDetails);
        }
      } catch (error) {
        this.logger.error(
          `Error checking worker for queue ${queueName}: ${error.message}`,
        );
      }
    }

    const hasActiveWorkers = queueStatuses.some((q) => q.workers > 0);

    return {
      status: hasActiveWorkers ? 'up' : 'down',
      error: hasActiveWorkers
        ? undefined
        : HEALTH_ERROR_MESSAGES.NO_ACTIVE_WORKERS,
      queues: queueStatuses,
    };
  }

  async getQueueMetricsOverTime(
    queueName: MessageQueue,
    timeRange: '7D' | '1D' | '12H' | '4H',
  ): Promise<WorkerMetricsData> {
    const redis = this.redisClient.getClient();
    const queue = new Queue(queueName, { connection: redis });

    try {
      const queueDetails = await this.getQueueDetails(queueName);
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

  async getAllQueuesMetricsOverTime(
    timeRange: '7D' | '1D' | '12H' | '4H',
  ): Promise<WorkerMetricsData[]> {
    const queues = Object.values(MessageQueue);
    const results: WorkerMetricsData[] = [];

    // Process queues sequentially to avoid overwhelming Redis
    for (const queueName of queues) {
      try {
        const metrics = await this.getQueueMetricsOverTime(
          queueName,
          timeRange,
        );

        results.push(metrics);
      } catch (error) {
        this.logger.error(
          `Error getting metrics for ${queueName}: ${error.message}`,
        );
      }
    }

    return results;
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
            color: '#4caf50',
          },
          {
            id: 'Failed Jobs',
            data: dataPoints.map((point) => ({
              x: formatForNivo(point.timestamp),
              y: point.failed,
            })),
            color: '#f44336',
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
