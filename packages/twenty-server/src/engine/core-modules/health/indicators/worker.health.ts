import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

import { Metrics, Queue } from 'bullmq';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { METRICS_FAILURE_RATE_THRESHOLD } from 'src/engine/core-modules/health/constants/metrics-failure-rate-threshold.const';
import { WorkerMetricsData } from 'src/engine/core-modules/health/types/worker-metrics-data.types';
import { WorkerQueueHealth } from 'src/engine/core-modules/health/types/worker-queue-health.type';
import { withHealthCheckTimeout } from 'src/engine/core-modules/health/utils/health-check-timeout.util';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

@Injectable()
export class WorkerHealthIndicator {
  constructor(
    private readonly redisClient: RedisClientService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  // Existing health check method
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

  // Reusable queue details fetching method
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
      await queue.close();

      return null;
    }
  }

  // Existing worker check method
  private async checkWorkers() {
    const queues = Object.values(MessageQueue);
    const queueStatuses: WorkerQueueHealth[] = [];

    for (const queueName of queues) {
      const queueDetails = await this.getQueueDetails(queueName);

      if (queueDetails) {
        queueStatuses.push(queueDetails);
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

  // Fixed metrics methods
  async getQueueMetricsOverTime(
    queueName: MessageQueue,
    timeRange: '7D' | '1D' | '12H' | '4H',
  ): Promise<WorkerMetricsData> {
    const redis = this.redisClient.getClient();
    const queue = new Queue(queueName, { connection: redis });

    try {
      // Get queue details first
      const queueDetails = await this.getQueueDetails(queueName);

      // Convert time range to number of data points (minutes)
      const pointsNeeded = this.getPointsForTimeRange(timeRange);

      // Fetch metrics for both completed and failed jobs
      const [completedMetricsObj, failedMetricsObj] = await Promise.all([
        queue.getMetrics('completed', 0, pointsNeeded - 1),
        queue.getMetrics('failed', 0, pointsNeeded - 1),
      ]);

      // Convert metrics objects to arrays of data points
      const completedMetrics = this.extractBullMQMetrics(completedMetricsObj);
      const failedMetrics = this.extractBullMQMetrics(failedMetricsObj);

      return this.transformMetricsForGraph(
        completedMetrics,
        failedMetrics,
        timeRange,
        queueName,
        queueDetails,
      );
    } finally {
      await queue.close();
    }
  }

  async getAllQueuesMetricsOverTime(
    timeRange: '7D' | '1D' | '12H' | '4H',
  ): Promise<WorkerMetricsData[]> {
    const queues = Object.values(MessageQueue);
    const metricsPromises = queues.map((queueName) =>
      this.getQueueMetricsOverTime(queueName, timeRange),
    );

    return Promise.all(metricsPromises);
  }

  private getPointsForTimeRange(timeRange: '7D' | '1D' | '12H' | '4H'): number {
    // Convert time ranges to minutes
    const timeRangeMap = {
      '4H': 4 * 60, // 4 hours in minutes
      '12H': 12 * 60, // 12 hours in minutes
      '1D': 24 * 60, // 1 day in minutes
      '7D': 7 * 24 * 60, // 7 days in minutes
    };

    return timeRangeMap[timeRange];
  }

  // Method to handle the BullMQ metrics format directly
  private extractBullMQMetrics(
    metrics: Metrics,
  ): { timestamp: number; count: number }[] {
    if (!metrics || !metrics.data || !Array.isArray(metrics.data)) {
      return [];
    }

    // Get current timestamp for relative time calculation
    const now = Date.now();

    // Extract timestamps and counts from the metrics array
    return metrics.data.map((count, index) => {
      // BullMQ metrics are stored with the most recent first (index 0)
      // and each step back represents 1 minute in the past
      const timestamp = now - index * 60 * 1000;

      return {
        timestamp,
        count: parseInt(count as unknown as string, 10) || 0,
      };
    });
  }

  private transformMetricsForGraph(
    completedMetrics: { timestamp: number; count: number }[],
    failedMetrics: { timestamp: number; count: number }[],
    timeRange: '7D' | '1D' | '12H' | '4H',
    queueName: MessageQueue,
    queueDetails: WorkerQueueHealth | null,
  ): WorkerMetricsData {
    // Create a map of timestamps to ensure we have data for each point
    const timestampMap = new Map();

    // Add completed metrics to the map
    completedMetrics.forEach((metric) => {
      const date = new Date(metric.timestamp);
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:00`;

      timestampMap.set(formattedDate, {
        x: formattedDate,
        completed: metric.count,
        failed: 0,
      });
    });

    // Add failed metrics to the map
    failedMetrics.forEach((metric) => {
      const date = new Date(metric.timestamp);
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:00`;

      if (timestampMap.has(formattedDate)) {
        const existing = timestampMap.get(formattedDate);

        existing.failed = metric.count;
      } else {
        timestampMap.set(formattedDate, {
          x: formattedDate,
          completed: 0,
          failed: metric.count,
        });
      }
    });

    // Convert map to array and sort by timestamp
    const dataPoints = Array.from(timestampMap.values()).sort(
      (a, b) => new Date(a.x).getTime() - new Date(b.x).getTime(),
    );

    return {
      queueName,
      timeRange,
      details: JSON.stringify(queueDetails),
      data: [
        {
          id: 'Completed Jobs',
          data: dataPoints.map((point) => ({ x: point.x, y: point.completed })),
          color: '#4caf50', // Green color for completed
        },
        {
          id: 'Failed Jobs',
          data: dataPoints.map((point) => ({ x: point.x, y: point.failed })),
          color: '#f44336', // Red color for failed
        },
      ],
    };
  }
}
