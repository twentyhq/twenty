import { Test, TestingModule } from '@nestjs/testing';

import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

import { AdminPanelHealthService } from 'src/engine/core-modules/admin-panel/admin-panel-health.service';
import { HEALTH_INDICATORS } from 'src/engine/core-modules/admin-panel/constants/health-indicators.constants';
import { SystemHealth } from 'src/engine/core-modules/admin-panel/dtos/system-health.dto';
import { AdminPanelHealthServiceStatus } from 'src/engine/core-modules/admin-panel/enums/admin-panel-health-service-status.enum';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { HealthIndicatorId } from 'src/engine/core-modules/health/enums/health-indicator-id.enum';
import { ConnectedAccountHealth } from 'src/engine/core-modules/health/indicators/connected-account.health';
import { DatabaseHealthIndicator } from 'src/engine/core-modules/health/indicators/database.health';
import { RedisHealthIndicator } from 'src/engine/core-modules/health/indicators/redis.health';
import { WorkerHealthIndicator } from 'src/engine/core-modules/health/indicators/worker.health';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

jest.mock('bullmq');

describe('AdminPanelHealthService', () => {
  let service: AdminPanelHealthService;
  let databaseHealth: jest.Mocked<DatabaseHealthIndicator>;
  let redisHealth: jest.Mocked<RedisHealthIndicator>;
  let workerHealth: jest.Mocked<WorkerHealthIndicator>;
  let connectedAccountHealth: jest.Mocked<ConnectedAccountHealth>;
  let redisClient: jest.Mocked<RedisClientService>;
  let environmentService: jest.Mocked<EnvironmentService>;

  beforeEach(async () => {
    databaseHealth = { isHealthy: jest.fn() } as any;
    redisHealth = { isHealthy: jest.fn() } as any;
    workerHealth = { isHealthy: jest.fn(), getQueueDetails: jest.fn() } as any;
    connectedAccountHealth = { isHealthy: jest.fn() } as any;
    redisClient = {
      getClient: jest.fn().mockReturnValue({} as Redis),
    } as any;
    environmentService = { get: jest.fn() } as any;

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
        { provide: RedisClientService, useValue: redisClient },
        { provide: EnvironmentService, useValue: environmentService },
      ],
    }).compile();

    service = module.get<AdminPanelHealthService>(AdminPanelHealthService);
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

      const result = await service.getSystemHealthStatus();

      const expected: SystemHealth = {
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
        details: JSON.stringify(details),
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
        details: undefined,
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
        details: HEALTH_ERROR_MESSAGES.REDIS_CONNECTION_FAILED,
      });
    });

    it('should throw error for invalid indicator', async () => {
      await expect(
        // @ts-expect-error Testing invalid input
        service.getIndicatorHealthStatus('invalid'),
      ).rejects.toThrow('Health indicator not found: invalid');
    });
  });
  describe('getQueueMetricsOverTime', () => {
    const mockQueue = {
      getMetrics: jest.fn(),
      getWorkers: jest.fn(),
      close: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      redisClient.getClient.mockReturnValue({} as Redis);
      (Queue as unknown as jest.Mock).mockImplementation(() => mockQueue);
      environmentService.get.mockReturnValue(60);
    });

    it('should return metrics data for a queue', async () => {
      const mockCompletedMetrics = { data: [10, 20, 30] };
      const mockFailedMetrics = { data: [1, 2, 3] };

      mockQueue.getMetrics
        .mockResolvedValueOnce(mockCompletedMetrics)
        .mockResolvedValueOnce(mockFailedMetrics);

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
        },
      });

      const result = await service.getQueueMetricsOverTime(
        MessageQueue.messagingQueue,
        '4H',
      );

      expect(result).toMatchObject({
        queueName: MessageQueue.messagingQueue,
        timeRange: '4H',
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 'Completed Jobs',
            data: expect.any(Array),
          }),
          expect.objectContaining({
            id: 'Failed Jobs',
            data: expect.any(Array),
          }),
        ]),
      });
    });

    it('should handle empty metrics data', async () => {
      mockQueue.getMetrics
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: [] });

      workerHealth.getQueueDetails.mockResolvedValue(null);

      const result = await service.getQueueMetricsOverTime(
        MessageQueue.messagingQueue,
        '4H',
      );

      expect(result.data).toHaveLength(2);
      expect(result.data[0].data).toHaveLength(48); // Default points for 4H
      expect(result.data[1].data).toHaveLength(48);
    });

    it('should handle metrics service errors', async () => {
      mockQueue.getMetrics.mockRejectedValue(new Error('Metrics error'));

      await expect(
        service.getQueueMetricsOverTime(MessageQueue.messagingQueue, '4H'),
      ).rejects.toThrow('Metrics error');
    });
  });

  describe('getMetricsParameters', () => {
    const testCases = [
      { timeRange: '4H', expected: { pointsNeeded: 48, intervalMinutes: 5 } },
      { timeRange: '12H', expected: { pointsNeeded: 48, intervalMinutes: 15 } },
      { timeRange: '1D', expected: { pointsNeeded: 48, intervalMinutes: 30 } },
      { timeRange: '7D', expected: { pointsNeeded: 48, intervalMinutes: 210 } },
    ];

    testCases.forEach(({ timeRange, expected }) => {
      it(`should return correct parameters for ${timeRange}`, () => {
        const result = service['getMetricsParameters'](timeRange as any);

        expect(result).toEqual(expected);
      });
    });
  });

  describe('generateEmptyTimeSeriesPoints', () => {
    it('should generate correct number of points with current value', () => {
      const result = service['generateEmptyTimeSeriesPoints'](5, 3, 10);

      expect(result).toHaveLength(3);
      expect(result[0].count).toBe(10);
      expect(result[1].count).toBe(0);
      expect(result[2].count).toBe(0);
    });

    it('should generate timestamps in descending order', () => {
      const result = service['generateEmptyTimeSeriesPoints'](5, 3);

      for (let i = 1; i < result.length; i++) {
        expect(result[i].timestamp).toBeLessThan(result[i - 1].timestamp);
      }
    });
  });
});
