import { HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { AdminPanelHealthService } from 'src/engine/core-modules/admin-panel/admin-panel-health.service';
import { SystemHealth } from 'src/engine/core-modules/admin-panel/dtos/system-health.dto';
import { AdminPanelHealthServiceStatus } from 'src/engine/core-modules/admin-panel/enums/admin-panel-health-service-status.enum';
import { HealthCacheService } from 'src/engine/core-modules/health/health-cache.service';
import { DatabaseHealthIndicator } from 'src/engine/core-modules/health/indicators/database.health';
import { RedisHealthIndicator } from 'src/engine/core-modules/health/indicators/redis.health';
import { WorkerHealthIndicator } from 'src/engine/core-modules/health/indicators/worker.health';

describe('AdminPanelHealthService', () => {
  let service: AdminPanelHealthService;
  let healthService: jest.Mocked<HealthCheckService>;
  let healthCacheService: jest.Mocked<HealthCacheService>;

  const defaultMockHealthCheck: HealthCheckResult = {
    status: 'ok',
    info: {
      database: { status: 'up' },
      redis: { status: 'up' },
      worker: {
        status: 'up',
        queues: [
          {
            name: 'test',
            workers: 1,
            status: 'up',
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
    },
    error: {},
    details: {
      database: { status: 'up' },
      redis: { status: 'up' },
      worker: {
        status: 'up',
        queues: [
          {
            name: 'test',
            workers: 1,
            status: 'up',
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
    },
  };

  beforeEach(async () => {
    healthService = {
      check: jest.fn().mockResolvedValue(defaultMockHealthCheck),
    } as unknown as jest.Mocked<HealthCheckService>;

    const mockMessageSync = {
      NOT_SYNCED: 0,
      ONGOING: 0,
      ACTIVE: 1,
      FAILED_INSUFFICIENT_PERMISSIONS: 0,
      FAILED_UNKNOWN: 0,
    };

    healthCacheService = {
      getMessageChannelSyncJobByStatusCounter: jest
        .fn()
        .mockResolvedValue(mockMessageSync),
    } as unknown as jest.Mocked<HealthCacheService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminPanelHealthService,
        {
          provide: HealthCheckService,
          useValue: healthService,
        },
        {
          provide: DatabaseHealthIndicator,
          useValue: {},
        },
        {
          provide: RedisHealthIndicator,
          useValue: {},
        },
        {
          provide: WorkerHealthIndicator,
          useValue: {},
        },
        {
          provide: HealthCacheService,
          useValue: healthCacheService,
        },
      ],
    }).compile();

    service = module.get<AdminPanelHealthService>(AdminPanelHealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should transform health check response to SystemHealth format', async () => {
    const mockMessageSync = {
      NOT_SYNCED: 1,
      ONGOING: 2,
      ACTIVE: 3,
      FAILED_INSUFFICIENT_PERMISSIONS: 0,
      FAILED_UNKNOWN: 0,
    };

    healthCacheService.getMessageChannelSyncJobByStatusCounter.mockResolvedValueOnce(
      mockMessageSync,
    );

    const result = await service.getSystemHealthStatus();

    const expected: SystemHealth = {
      database: {
        status: AdminPanelHealthServiceStatus.OPERATIONAL,
        details: undefined,
      },
      redis: {
        status: AdminPanelHealthServiceStatus.OPERATIONAL,
        details: undefined,
      },
      worker: {
        status: AdminPanelHealthServiceStatus.OPERATIONAL,
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
      messageSync: mockMessageSync,
    };

    expect(result).toStrictEqual(expected);
  });

  it('should handle mixed health statuses', async () => {
    const mockHealthCheck: HealthCheckResult = {
      status: 'error',
      info: {
        database: { status: 'up' },
        worker: { status: 'up' },
      },
      error: {
        redis: { status: 'down' },
      },
      details: {
        database: { status: 'up' },
        redis: { status: 'down' },
        worker: { status: 'up' },
      },
    };

    healthService.check.mockResolvedValueOnce(mockHealthCheck);

    const result = await service.getSystemHealthStatus();

    expect(result).toMatchObject({
      database: { status: AdminPanelHealthServiceStatus.OPERATIONAL },
      redis: { status: AdminPanelHealthServiceStatus.OUTAGE },
      worker: { status: AdminPanelHealthServiceStatus.OPERATIONAL },
    });
  });

  it('should handle all services down', async () => {
    const mockHealthCheck: HealthCheckResult = {
      status: 'error',
      info: {},
      error: {
        database: { status: 'down' },
        redis: { status: 'down' },
        worker: {
          status: 'down',
          queues: [
            {
              name: 'test',
              workers: 0,
              status: AdminPanelHealthServiceStatus.OUTAGE,
            },
          ],
        },
      },
      details: {
        database: { status: 'down' },
        redis: { status: 'down' },
        worker: {
          status: 'down',
          queues: [
            {
              name: 'test',
              workers: 0,
              status: AdminPanelHealthServiceStatus.OUTAGE,
            },
          ],
        },
      },
    };

    healthService.check.mockResolvedValueOnce(mockHealthCheck);

    const result = await service.getSystemHealthStatus();

    expect(result).toMatchObject({
      database: { status: AdminPanelHealthServiceStatus.OUTAGE },
      redis: { status: AdminPanelHealthServiceStatus.OUTAGE },
      worker: { status: AdminPanelHealthServiceStatus.OUTAGE },
    });
  });
});
