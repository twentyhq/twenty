import { HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { AdminPanelHealthService } from 'src/engine/core-modules/admin-panel/admin-panel-health.service';
import { SystemHealth } from 'src/engine/core-modules/admin-panel/dtos/system-health.dto';
import { HealthServiceStatus } from 'src/engine/core-modules/health/enums/health-service-status.enum';
import { HealthCacheService } from 'src/engine/core-modules/health/health-cache.service';
import { DatabaseHealthIndicator } from 'src/engine/core-modules/health/indicators/database.health';
import { RedisHealthIndicator } from 'src/engine/core-modules/health/indicators/redis.health';
import { WorkerHealthIndicator } from 'src/engine/core-modules/health/indicators/worker.health';

describe('AdminPanelHealthService', () => {
  let service: AdminPanelHealthService;
  let healthService: jest.Mocked<HealthCheckService>;
  let healthCacheService: jest.Mocked<HealthCacheService>;

  beforeEach(async () => {
    const mockHealthCheck: HealthCheckResult = {
      status: 'ok',
      info: {
        database: { status: 'up' },
        redis: { status: 'up' },
        worker: { status: 'up' },
      },
      error: {},
      details: {
        database: { status: 'up' },
        redis: { status: 'up' },
        worker: { status: 'up' },
      },
    };

    const mockMessageSync = {
      NOT_SYNCED: 0,
      ONGOING: 0,
      ACTIVE: 1,
      FAILED_INSUFFICIENT_PERMISSIONS: 0,
      FAILED_UNKNOWN: 0,
    };

    healthService = {
      check: jest.fn().mockResolvedValue(mockHealthCheck),
    } as unknown as jest.Mocked<HealthCheckService>;

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
    const mockHealthCheck: HealthCheckResult = {
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
              status: HealthServiceStatus.OPERATIONAL,
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
              status: HealthServiceStatus.OPERATIONAL,
            },
          ],
        },
      },
    };

    const mockMessageSync = {
      NOT_SYNCED: 1,
      ONGOING: 2,
      ACTIVE: 3,
      FAILED_INSUFFICIENT_PERMISSIONS: 0,
      FAILED_UNKNOWN: 0,
    };

    healthService.check.mockResolvedValueOnce(mockHealthCheck);
    healthCacheService.getMessageChannelSyncJobByStatusCounter.mockResolvedValueOnce(
      mockMessageSync,
    );

    const result = await service.getSystemHealthStatus();

    const expected: SystemHealth = {
      database: {
        status: HealthServiceStatus.OPERATIONAL,
        details: undefined,
      },
      redis: {
        status: HealthServiceStatus.OPERATIONAL,
        details: undefined,
      },
      worker: {
        status: HealthServiceStatus.OPERATIONAL,
        queues: [
          { name: 'test', workers: 1, status: HealthServiceStatus.OPERATIONAL },
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
      database: { status: HealthServiceStatus.OPERATIONAL },
      redis: { status: HealthServiceStatus.OUTAGE },
      worker: { status: HealthServiceStatus.OPERATIONAL },
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
            { name: 'test', workers: 0, status: HealthServiceStatus.OUTAGE },
          ],
        },
      },
      details: {
        database: { status: 'down' },
        redis: { status: 'down' },
        worker: {
          status: 'down',
          queues: [
            { name: 'test', workers: 0, status: HealthServiceStatus.OUTAGE },
          ],
        },
      },
    };

    healthService.check.mockResolvedValueOnce(mockHealthCheck);

    const result = await service.getSystemHealthStatus();

    expect(result).toMatchObject({
      database: { status: HealthServiceStatus.OUTAGE },
      redis: { status: HealthServiceStatus.OUTAGE },
      worker: { status: HealthServiceStatus.OUTAGE },
    });
  });
});
