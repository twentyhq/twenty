import { Test, type TestingModule } from '@nestjs/testing';

import { Queue } from 'bullmq';
import { type Redis } from 'ioredis';

import { AdminPanelHealthService } from 'src/engine/core-modules/admin-panel/admin-panel-health.service';
import { HEALTH_INDICATORS } from 'src/engine/core-modules/admin-panel/constants/health-indicators.constants';
import { type SystemHealthDTO } from 'src/engine/core-modules/admin-panel/dtos/system-health.dto';
import { AdminPanelHealthServiceStatus } from 'src/engine/core-modules/admin-panel/enums/admin-panel-health-service-status.enum';
import { QueueMetricsTimeRange } from 'src/engine/core-modules/admin-panel/enums/queue-metrics-time-range.enum';
import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { HealthIndicatorId } from 'src/engine/core-modules/health/enums/health-indicator-id.enum';
import { AppHealthIndicator } from 'src/engine/core-modules/health/indicators/app.health';
import { ConnectedAccountHealth } from 'src/engine/core-modules/health/indicators/connected-account.health';
import { DatabaseHealthIndicator } from 'src/engine/core-modules/health/indicators/database.health';
import { RedisHealthIndicator } from 'src/engine/core-modules/health/indicators/redis.health';
import { WorkerHealthIndicator } from 'src/engine/core-modules/health/indicators/worker.health';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

jest.mock('bullmq');

describe('AdminPanelHealthService', () => {
  let service: AdminPanelHealthService;
  let databaseHealth: jest.Mocked<DatabaseHealthIndicator>;
  let redisHealth: jest.Mocked<RedisHealthIndicator>;
  let workerHealth: jest.Mocked<WorkerHealthIndicator>;
  let connectedAccountHealth: jest.Mocked<ConnectedAccountHealth>;
  let appHealth: jest.Mocked<AppHealthIndicator>;
  let redisClient: jest.Mocked<RedisClientService>;
  let twentyConfigService: jest.Mocked<TwentyConfigService>;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    databaseHealth = { isHealthy: jest.fn() } as any;
    redisHealth = { isHealthy: jest.fn() } as any;
    workerHealth = { isHealthy: jest.fn(), getQueueDetails: jest.fn() } as any;
    connectedAccountHealth = { isHealthy: jest.fn() } as any;
    appHealth = { isHealthy: jest.fn() } as any;
    redisClient = {
      getClient: jest.fn().mockReturnValue({} as Redis),
      getQueueClient: jest.fn().mockReturnValue({} as Redis),
    } as any;
    twentyConfigService = { get: jest.fn() } as any;

    (Queue as unknown as jest.Mock) = jest.fn().mockImplementation(() => ({
      getMetrics: jest.fn(),
      getWorkers: jest.fn(),
      close: jest.fn(),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminPanelHealthService,
        { provide: DatabaseHealthIndicator, useValue: databaseHealth },
        { provide: RedisHealthIndicator, useValue: redisHealth },
        { provide: WorkerHealthIndicator, useValue: workerHealth },
        { provide: ConnectedAccountHealth, useValue: connectedAccountHealth },
        { provide: AppHealthIndicator, useValue: appHealth },
        { provide: RedisClientService, useValue: redisClient },
        { provide: TwentyConfigService, useValue: twentyConfigService },
      ],
    }).compile();

    service = module.get<AdminPanelHealthService>(AdminPanelHealthService);

    // Override the healthIndicators mapping with our mocked instances
    (service as any)['healthIndicators'] = {
      [HealthIndicatorId.database]: databaseHealth,
      [HealthIndicatorId.redis]: redisHealth,
      [HealthIndicatorId.worker]: workerHealth,
      [HealthIndicatorId.connectedAccount]: connectedAccountHealth,
      [HealthIndicatorId.app]: appHealth,
    };

    loggerSpy = jest
      .spyOn(service['logger'], 'error')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    loggerSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSystemHealthStatus', () => {
    it('should transform health check response to SystemHealth format', async () => {
      databaseHealth.isHealthy.mockResolvedValue({
        database: { status: 'up', details: 'Database is healthy' },
      });
      redisHealth.isHealthy.mockResolvedValue({
        redis: { status: 'up', details: 'Redis is connected' },
      });
      workerHealth.isHealthy.mockResolvedValue({
        worker: {
          status: 'up',
          queues: [
            {
              queueName: 'test',
              workers: 1,
              metrics: {
                active: 1,
                completed: 0,
                delayed: 4,
                failed: 3,
                waiting: 0,
                failureRate: 0.3,
              },
              status: 'up',
            },
          ],
        },
      });
      connectedAccountHealth.isHealthy.mockResolvedValue({
        connectedAccount: {
          status: 'up',
          details: 'Account sync is operational',
        },
      });
      appHealth.isHealthy.mockResolvedValue({
        app: {
          status: 'up',
          details: {
            system: {
              nodeVersion: '16.0',
            },
            workspaces: {
              totalWorkspaces: 1,
              healthStatus: [
                {
                  workspaceId: '1',
                  summary: {
                    structuralIssues: 0,
                    dataIssues: 0,
                    relationshipIssues: 0,
                    pendingMigrations: 0,
                  },
                  severity: 'healthy',
                  details: {},
                },
              ],
            },
          },
        },
      });

      const result = await service.getSystemHealthStatus();

      const expected: SystemHealthDTO = {
        services: [
          {
            ...HEALTH_INDICATORS[HealthIndicatorId.database],
            status: AdminPanelHealthServiceStatus.OPERATIONAL,
          },
          {
            ...HEALTH_INDICATORS[HealthIndicatorId.redis],
            status: AdminPanelHealthServiceStatus.OPERATIONAL,
          },
          {
            ...HEALTH_INDICATORS[HealthIndicatorId.worker],
            status: AdminPanelHealthServiceStatus.OPERATIONAL,
          },
          {
            ...HEALTH_INDICATORS[HealthIndicatorId.connectedAccount],
            status: AdminPanelHealthServiceStatus.OPERATIONAL,
          },
          {
            ...HEALTH_INDICATORS[HealthIndicatorId.app],
            status: AdminPanelHealthServiceStatus.OPERATIONAL,
          },
        ],
      };

      expect(result).toStrictEqual(expected);
    });

    it('should handle mixed health statuses', async () => {
      databaseHealth.isHealthy.mockResolvedValue({
        database: { status: 'up' },
      });
      redisHealth.isHealthy.mockRejectedValue(
        new Error(HEALTH_ERROR_MESSAGES.REDIS_CONNECTION_FAILED),
      );
      workerHealth.isHealthy.mockResolvedValue({
        worker: { status: 'up', queues: [] },
      });
      connectedAccountHealth.isHealthy.mockResolvedValue({
        connectedAccount: { status: 'up' },
      });
      appHealth.isHealthy.mockResolvedValue({
        app: { status: 'down', details: {} },
      });

      const result = await service.getSystemHealthStatus();

      expect(result).toStrictEqual({
        services: [
          {
            ...HEALTH_INDICATORS[HealthIndicatorId.database],
            status: AdminPanelHealthServiceStatus.OPERATIONAL,
          },
          {
            ...HEALTH_INDICATORS[HealthIndicatorId.redis],
            status: AdminPanelHealthServiceStatus.OUTAGE,
          },
          {
            ...HEALTH_INDICATORS[HealthIndicatorId.worker],
            status: AdminPanelHealthServiceStatus.OPERATIONAL,
          },
          {
            ...HEALTH_INDICATORS[HealthIndicatorId.connectedAccount],
            status: AdminPanelHealthServiceStatus.OPERATIONAL,
          },
          {
            ...HEALTH_INDICATORS[HealthIndicatorId.app],
            status: AdminPanelHealthServiceStatus.OUTAGE,
          },
        ],
      });
    });

    it('should handle all services down', async () => {
      databaseHealth.isHealthy.mockRejectedValue(
        new Error(HEALTH_ERROR_MESSAGES.DATABASE_CONNECTION_FAILED),
      );
      redisHealth.isHealthy.mockRejectedValue(
        new Error(HEALTH_ERROR_MESSAGES.REDIS_CONNECTION_FAILED),
      );
      workerHealth.isHealthy.mockRejectedValue(
        new Error(HEALTH_ERROR_MESSAGES.NO_ACTIVE_WORKERS),
      );
      connectedAccountHealth.isHealthy.mockRejectedValue(
        new Error(HEALTH_ERROR_MESSAGES.MESSAGE_SYNC_CHECK_FAILED),
      );
      appHealth.isHealthy.mockRejectedValue(
        new Error(HEALTH_ERROR_MESSAGES.APP_HEALTH_CHECK_FAILED),
      );

      const result = await service.getSystemHealthStatus();

      expect(result).toStrictEqual({
        services: [
          {
            ...HEALTH_INDICATORS[HealthIndicatorId.database],
            status: AdminPanelHealthServiceStatus.OUTAGE,
          },
          {
            ...HEALTH_INDICATORS[HealthIndicatorId.redis],
            status: AdminPanelHealthServiceStatus.OUTAGE,
          },
          {
            ...HEALTH_INDICATORS[HealthIndicatorId.worker],
            status: AdminPanelHealthServiceStatus.OUTAGE,
          },
          {
            ...HEALTH_INDICATORS[HealthIndicatorId.connectedAccount],
            status: AdminPanelHealthServiceStatus.OUTAGE,
          },
          {
            ...HEALTH_INDICATORS[HealthIndicatorId.app],
            status: AdminPanelHealthServiceStatus.OUTAGE,
          },
        ],
      });
    });
  });

  describe('getIndicatorHealthStatus', () => {
    it('should return health status for database indicator', async () => {
      const details = {
        version: '15.0',
        connections: { active: 5, max: 100 },
      };

      databaseHealth.isHealthy.mockResolvedValue({
        database: {
          status: 'up',
          details,
        },
      });

      const result = await service.getIndicatorHealthStatus(
        HealthIndicatorId.database,
      );

      expect(result).toStrictEqual({
        ...HEALTH_INDICATORS[HealthIndicatorId.database],
        status: AdminPanelHealthServiceStatus.OPERATIONAL,
        details: JSON.stringify({ details }),
        errorMessage: undefined,
        queues: undefined,
      });
    });

    it('should return health status with queues for worker indicator', async () => {
      const mockQueues = [
        {
          queueName: 'queue1',
          workers: 2,
          status: 'up',
        },
        {
          queueName: 'queue2',
          workers: 0,
          status: 'up',
        },
      ];

      workerHealth.isHealthy.mockResolvedValue({
        worker: {
          status: 'up',
          queues: mockQueues,
        },
      });

      const result = await service.getIndicatorHealthStatus(
        HealthIndicatorId.worker,
      );

      expect(result).toStrictEqual({
        ...HEALTH_INDICATORS[HealthIndicatorId.worker],
        status: AdminPanelHealthServiceStatus.OPERATIONAL,
        details: JSON.stringify({ queues: mockQueues }),
        errorMessage: undefined,
        queues: mockQueues.map((queue) => ({
          id: `worker-${queue.queueName}`,
          queueName: queue.queueName,
          status:
            queue.workers > 0
              ? AdminPanelHealthServiceStatus.OPERATIONAL
              : AdminPanelHealthServiceStatus.OUTAGE,
        })),
      });
    });

    it('should handle failed indicator health check', async () => {
      redisHealth.isHealthy.mockRejectedValue(
        new Error(HEALTH_ERROR_MESSAGES.REDIS_CONNECTION_FAILED),
      );

      const result = await service.getIndicatorHealthStatus(
        HealthIndicatorId.redis,
      );

      expect(result).toStrictEqual({
        ...HEALTH_INDICATORS[HealthIndicatorId.redis],
        status: AdminPanelHealthServiceStatus.OUTAGE,
        details: undefined,
        errorMessage: HEALTH_ERROR_MESSAGES.REDIS_CONNECTION_FAILED,
      });
    });

    it('should throw error for invalid indicator', async () => {
      await expect(
        // @ts-expect-error Testing invalid input
        service.getIndicatorHealthStatus('invalid'),
      ).rejects.toThrow('Health indicator not found: invalid');
    });
  });

  describe('getQueueMetrics', () => {
    const mockQueue = {
      getMetrics: jest.fn(),
      getWorkers: jest.fn(),
      close: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      redisClient.getClient.mockReturnValue({} as Redis);
      redisClient.getQueueClient.mockReturnValue({} as Redis);
      (Queue as unknown as jest.Mock).mockImplementation(() => mockQueue);
    });

    it('should return metrics data for a queue with correct data transformation', async () => {
      const mockCompletedData = Array(240)
        .fill(0)
        .map((_, i) => i);
      const mockFailedData = Array(240)
        .fill(0)
        .map((_, i) => i * 0.1);

      workerHealth.getQueueDetails.mockResolvedValue({
        queueName: 'test-queue',
        workers: 1,
        status: 'up',
        metrics: {
          active: 1,
          completed: 30,
          failed: 3,
          waiting: 0,
          delayed: 0,
          failureRate: 9.1,
          completedData: mockCompletedData,
          failedData: mockFailedData,
        },
      });

      const result = await service.getQueueMetrics(
        MessageQueue.messagingQueue,
        QueueMetricsTimeRange.FourHours,
      );

      expect(result).toMatchObject({
        queueName: MessageQueue.messagingQueue,
        timeRange: QueueMetricsTimeRange.FourHours,
        workers: 1,
        details: expect.any(Object),
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 'Completed Jobs',
            data: expect.arrayContaining([
              expect.objectContaining({
                x: expect.any(Number),
                y: expect.any(Number),
              }),
            ]),
          }),
          expect.objectContaining({
            id: 'Failed Jobs',
            data: expect.arrayContaining([
              expect.objectContaining({
                x: expect.any(Number),
                y: expect.any(Number),
              }),
            ]),
          }),
        ]),
      });
    });

    it('should handle empty metrics data', async () => {
      workerHealth.getQueueDetails.mockResolvedValue(null);

      const result = await service.getQueueMetrics(
        MessageQueue.messagingQueue,
        QueueMetricsTimeRange.FourHours,
      );

      expect(result.data).toHaveLength(2);
      expect(result.data[0].data).toHaveLength(240);
      expect(result.data[1].data).toHaveLength(240);
    });

    it('should handle metrics service errors', async () => {
      workerHealth.getQueueDetails.mockRejectedValue(
        new Error('Metrics error'),
      );

      await expect(
        service.getQueueMetrics(
          MessageQueue.messagingQueue,
          QueueMetricsTimeRange.FourHours,
        ),
      ).rejects.toThrow('Metrics error');

      expect(loggerSpy).toHaveBeenCalledWith(
        'Error getting metrics for messaging-queue: Metrics error',
      );
    });

    describe('backfilling behavior', () => {
      it('should handle partial data with correct historical backfilling', async () => {
        // Test with 40 recent points for 4-hour range (needs 240 points)
        const partialData = Array(40)
          .fill(0)
          .map((_, i) => i + 1);

        workerHealth.getQueueDetails.mockResolvedValue({
          queueName: 'test-queue',
          workers: 1,
          status: 'up',
          metrics: {
            failed: 0,
            completed: 0,
            waiting: 0,
            active: 0,
            delayed: 0,
            failureRate: 0,
            completedData: partialData,
            failedData: partialData,
          },
        });

        const result = await service.getQueueMetrics(
          MessageQueue.messagingQueue,
          QueueMetricsTimeRange.FourHours,
        );

        // Should have 240 total points
        expect(result.data[0].data).toHaveLength(240);

        // First 200 points should be zero (historical backfill)
        const historicalPoints = result.data[0].data.slice(0, 200);

        expect(historicalPoints.every((point) => point.y === 0)).toBe(true);

        // Last 40 points should be actual data
        const actualDataPoints = result.data[0].data.slice(200);

        expect(actualDataPoints.every((point) => point.y > 0)).toBe(true);

        // Verify chronological order (increasing values)
        const nonZeroValues = actualDataPoints.map((point) => point.y);

        for (let i = 1; i < nonZeroValues.length; i++) {
          expect(nonZeroValues[i]).toBeGreaterThan(nonZeroValues[i - 1]);
        }
      });

      it('should handle completely empty data with full backfilling', async () => {
        workerHealth.getQueueDetails.mockResolvedValue({
          queueName: 'test-queue',
          workers: 1,
          status: 'up',
          metrics: {
            failed: 0,
            completed: 0,
            waiting: 0,
            active: 0,
            delayed: 0,
            failureRate: 0,
            completedData: [],
            failedData: [],
          },
        });

        const result = await service.getQueueMetrics(
          MessageQueue.messagingQueue,
          QueueMetricsTimeRange.OneHour,
        );

        // Should have 60 points for one hour
        expect(result.data[0].data).toHaveLength(60);
        // All points should be zero
        expect(result.data[0].data.every((point) => point.y === 0)).toBe(true);
      });
    });

    describe('sampling behavior', () => {
      it('should correctly sample data for different time ranges', async () => {
        const testCases = [
          {
            timeRange: QueueMetricsTimeRange.OneHour,
            expectedPoints: 60,
            samplingFactor: 1,
          },
          {
            timeRange: QueueMetricsTimeRange.FourHours,
            expectedPoints: 240,
            samplingFactor: 1,
          },
          {
            timeRange: QueueMetricsTimeRange.OneDay,
            expectedPoints: 240,
            samplingFactor: 6,
          },
        ];

        for (const testCase of testCases) {
          // Create test data with non-zero values
          const testData = Array(testCase.expectedPoints * 2)
            .fill(0)
            .map((_, i) => i + 1); // Start from 1 to avoid zero values

          workerHealth.getQueueDetails.mockResolvedValue({
            queueName: 'test-queue',
            workers: 1,
            status: 'up',
            metrics: {
              failed: 0,
              completed: 0,
              waiting: 0,
              active: 0,
              delayed: 0,
              failureRate: 0,
              completedData: testData,
              failedData: testData,
            },
          });

          const result = await service.getQueueMetrics(
            MessageQueue.messagingQueue,
            testCase.timeRange,
          );

          expect(result.data[0].data).toHaveLength(testCase.expectedPoints);

          if (testCase.samplingFactor > 1) {
            const sampledData = result.data[0].data;

            for (let i = 0; i < sampledData.length; i++) {
              const start = i * testCase.samplingFactor;
              const end = start + testCase.samplingFactor;
              const originalDataSlice = testData.slice(start, end);

              if (originalDataSlice.length > 0) {
                // Add this check
                const maxInSlice = Math.max(...originalDataSlice);

                expect(sampledData[i].y).toBeLessThanOrEqual(maxInSlice);
              }
            }
          }
        }
      });
    });
  });

  describe('getPointsConfiguration', () => {
    const testCases = [
      {
        timeRange: QueueMetricsTimeRange.OneHour,
        expected: {
          pointsNeeded: 60,
          samplingFactor: 1,
          targetVisualizationPoints: 240,
        },
      },
      {
        timeRange: QueueMetricsTimeRange.FourHours,
        expected: {
          pointsNeeded: 240,
          samplingFactor: 1,
          targetVisualizationPoints: 240,
        },
      },
      {
        timeRange: QueueMetricsTimeRange.TwelveHours,
        expected: {
          pointsNeeded: 720,
          samplingFactor: 3,
          targetVisualizationPoints: 240,
        },
      },
      {
        timeRange: QueueMetricsTimeRange.OneDay,
        expected: {
          pointsNeeded: 1440,
          samplingFactor: 6,
          targetVisualizationPoints: 240,
        },
      },
      {
        timeRange: QueueMetricsTimeRange.SevenDays,
        expected: {
          pointsNeeded: 10080,
          samplingFactor: 42,
          targetVisualizationPoints: 240,
        },
      },
    ];

    testCases.forEach(({ timeRange, expected }) => {
      it(`should return correct parameters for ${timeRange}`, () => {
        const result = service['getPointsConfiguration'](timeRange as any);

        expect(result).toEqual(expected);
      });
    });
  });
});
