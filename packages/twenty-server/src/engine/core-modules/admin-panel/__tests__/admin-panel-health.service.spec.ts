import { Test, TestingModule } from '@nestjs/testing';

import { AdminPanelHealthService } from 'src/engine/core-modules/admin-panel/admin-panel-health.service';
import { HEALTH_INDICATORS } from 'src/engine/core-modules/admin-panel/constants/health-indicators.constants';
import { SystemHealth } from 'src/engine/core-modules/admin-panel/dtos/system-health.dto';
import { AdminPanelHealthServiceStatus } from 'src/engine/core-modules/admin-panel/enums/admin-panel-health-service-status.enum';
import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { HealthIndicatorId } from 'src/engine/core-modules/health/enums/health-indicator-id.enum';
import { ConnectedAccountHealth } from 'src/engine/core-modules/health/indicators/connected-account.health';
import { DatabaseHealthIndicator } from 'src/engine/core-modules/health/indicators/database.health';
import { RedisHealthIndicator } from 'src/engine/core-modules/health/indicators/redis.health';
import { WorkerHealthIndicator } from 'src/engine/core-modules/health/indicators/worker.health';

describe('AdminPanelHealthService', () => {
  let service: AdminPanelHealthService;
  let databaseHealth: jest.Mocked<DatabaseHealthIndicator>;
  let redisHealth: jest.Mocked<RedisHealthIndicator>;
  let workerHealth: jest.Mocked<WorkerHealthIndicator>;
  let connectedAccountHealth: jest.Mocked<ConnectedAccountHealth>;

  beforeEach(async () => {
    databaseHealth = { isHealthy: jest.fn() } as any;
    redisHealth = { isHealthy: jest.fn() } as any;
    workerHealth = { isHealthy: jest.fn() } as any;
    connectedAccountHealth = { isHealthy: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminPanelHealthService,
        { provide: DatabaseHealthIndicator, useValue: databaseHealth },
        { provide: RedisHealthIndicator, useValue: redisHealth },
        { provide: WorkerHealthIndicator, useValue: workerHealth },
        { provide: ConnectedAccountHealth, useValue: connectedAccountHealth },
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
                prioritized: 0,
              },
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
          metrics: {
            active: 1,
            completed: 10,
            delayed: 0,
            failed: 2,
            waiting: 5,
            prioritized: 1,
          },
        },
        {
          queueName: 'queue2',
          workers: 0,
          metrics: {
            active: 0,
            completed: 5,
            delayed: 0,
            failed: 1,
            waiting: 2,
            prioritized: 0,
          },
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
          ...queue,
          id: `worker-${queue.queueName}`,
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
});
