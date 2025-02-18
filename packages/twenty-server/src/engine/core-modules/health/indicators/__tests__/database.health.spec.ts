import { HealthIndicatorService } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { DataSource } from 'typeorm';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { HEALTH_INDICATORS_TIMEOUT } from 'src/engine/core-modules/health/constants/health-indicators-timeout.conts';
import { DatabaseHealthIndicator } from 'src/engine/core-modules/health/indicators/database.health';

describe('DatabaseHealthIndicator', () => {
  let service: DatabaseHealthIndicator;
  let dataSource: jest.Mocked<DataSource>;
  let healthIndicatorService: jest.Mocked<HealthIndicatorService>;

  beforeEach(async () => {
    dataSource = {
      query: jest.fn(),
    } as any;

    healthIndicatorService = {
      check: jest.fn().mockReturnValue({
        up: jest.fn().mockImplementation((data) => ({
          database: { status: 'up', ...data },
        })),
        down: jest.fn().mockImplementation((error) => ({
          database: {
            status: 'down',
            error,
          },
        })),
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseHealthIndicator,
        {
          provide: 'coreDataSource',
          useValue: dataSource,
        },
        {
          provide: HealthIndicatorService,
          useValue: healthIndicatorService,
        },
      ],
    }).compile();

    service = module.get<DatabaseHealthIndicator>(DatabaseHealthIndicator);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return up status with details when database responds', async () => {
    const mockResponses = [
      [{ version: 'PostgreSQL 15.6' }],
      [{ count: '5' }],
      [{ max_connections: '100' }],
      [{ uptime: '3600' }],
      [{ size: '1 GB' }],
      [{ table_stats: [] }],
      [{ ratio: '95.5' }],
      [{ deadlocks: '0' }],
      [{ count: '0' }],
    ];

    mockResponses.forEach((response) => {
      dataSource.query.mockResolvedValueOnce(response);
    });

    const result = await service.isHealthy();

    expect(result.database.status).toBe('up');
    expect(result.database.details).toBeDefined();
    expect(result.database.details.version).toBeDefined();
    expect(result.database.details.connections).toBeDefined();
    expect(result.database.details.performance).toBeDefined();
  });

  it('should return down status when database fails', async () => {
    dataSource.query.mockRejectedValueOnce(
      new Error(HEALTH_ERROR_MESSAGES.DATABASE_CONNECTION_FAILED),
    );

    const result = await service.isHealthy();

    expect(result.database.status).toBe('down');
    expect(result.database.error).toBe(
      HEALTH_ERROR_MESSAGES.DATABASE_CONNECTION_FAILED,
    );
  });

  it('should timeout after specified duration', async () => {
    dataSource.query.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(resolve, HEALTH_INDICATORS_TIMEOUT + 100),
        ),
    );

    const healthCheckPromise = service.isHealthy();

    jest.advanceTimersByTime(HEALTH_INDICATORS_TIMEOUT + 1);

    const result = await healthCheckPromise;

    expect(result.database.status).toBe('down');
    expect(result.database.error).toBe(HEALTH_ERROR_MESSAGES.DATABASE_TIMEOUT);
  });
});
