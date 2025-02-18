import { Test, TestingModule } from '@nestjs/testing';

import { AdminPanelHealthService } from 'src/engine/core-modules/admin-panel/admin-panel-health.service';
import { SystemHealth } from 'src/engine/core-modules/admin-panel/dtos/system-health.dto';
import { AdminPanelHealthServiceStatus } from 'src/engine/core-modules/admin-panel/enums/admin-panel-health-service-status.enum';
import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { DatabaseHealthIndicator } from 'src/engine/core-modules/health/indicators/database.health';
import { MessageSyncHealthIndicator } from 'src/engine/core-modules/health/indicators/message-sync.health';
import { RedisHealthIndicator } from 'src/engine/core-modules/health/indicators/redis.health';
import { WorkerHealthIndicator } from 'src/engine/core-modules/health/indicators/worker.health';

describe('AdminPanelHealthService', () => {
  let service: AdminPanelHealthService;
  let databaseHealth: jest.Mocked<DatabaseHealthIndicator>;
  let redisHealth: jest.Mocked<RedisHealthIndicator>;
  let workerHealth: jest.Mocked<WorkerHealthIndicator>;
  let messageSyncHealth: jest.Mocked<MessageSyncHealthIndicator>;

  beforeEach(async () => {
    databaseHealth = {
      isHealthy: jest.fn(),
    } as any;

    redisHealth = {
      isHealthy: jest.fn(),
    } as any;

    workerHealth = {
      isHealthy: jest.fn(),
    } as any;

    messageSyncHealth = {
      isHealthy: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminPanelHealthService,
        {
          provide: DatabaseHealthIndicator,
          useValue: databaseHealth,
        },
        {
          provide: RedisHealthIndicator,
          useValue: redisHealth,
        },
        {
          provide: WorkerHealthIndicator,
          useValue: workerHealth,
        },
        {
          provide: MessageSyncHealthIndicator,
          useValue: messageSyncHealth,
        },
      ],
    }).compile();

    service = module.get<AdminPanelHealthService>(AdminPanelHealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should transform health check response to SystemHealth format', async () => {
    databaseHealth.isHealthy.mockResolvedValue({
      database: {
        status: 'up',
        details: 'Database is healthy',
      },
    });
    redisHealth.isHealthy.mockResolvedValue({
      redis: {
        status: 'up',
        details: 'Redis is connected',
      },
    });
    workerHealth.isHealthy.mockResolvedValue({
      worker: {
        status: 'up',
        queues: [
          {
            name: 'test',
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
    messageSyncHealth.isHealthy.mockResolvedValue({
      messageSync: {
        status: 'up',
        details: 'Message sync is operational',
      },
    });

    const result = await service.getSystemHealthStatus();

    const expected: SystemHealth = {
      database: {
        status: AdminPanelHealthServiceStatus.OPERATIONAL,
        details: '"Database is healthy"',
        queues: undefined,
      },
      redis: {
        status: AdminPanelHealthServiceStatus.OPERATIONAL,
        details: '"Redis is connected"',
        queues: undefined,
      },
      worker: {
        status: AdminPanelHealthServiceStatus.OPERATIONAL,
        details: undefined,
        queues: [
          {
            name: 'test',
            workers: 1,
            status: AdminPanelHealthServiceStatus.OPERATIONAL,
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
      messageSync: {
        status: AdminPanelHealthServiceStatus.OPERATIONAL,
        details: '"Message sync is operational"',
        queues: undefined,
      },
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
    messageSyncHealth.isHealthy.mockResolvedValue({
      messageSync: { status: 'up' },
    });

    const result = await service.getSystemHealthStatus();

    expect(result).toMatchObject({
      database: { status: AdminPanelHealthServiceStatus.OPERATIONAL },
      redis: { status: AdminPanelHealthServiceStatus.OUTAGE },
      worker: { status: AdminPanelHealthServiceStatus.OPERATIONAL },
      messageSync: { status: AdminPanelHealthServiceStatus.OPERATIONAL },
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
    messageSyncHealth.isHealthy.mockRejectedValue(
      new Error(HEALTH_ERROR_MESSAGES.MESSAGE_SYNC_CHECK_FAILED),
    );

    const result = await service.getSystemHealthStatus();

    expect(result).toMatchObject({
      database: { status: AdminPanelHealthServiceStatus.OUTAGE },
      redis: { status: AdminPanelHealthServiceStatus.OUTAGE },
      worker: { status: AdminPanelHealthServiceStatus.OUTAGE },
      messageSync: { status: AdminPanelHealthServiceStatus.OUTAGE },
    });
  });
});
