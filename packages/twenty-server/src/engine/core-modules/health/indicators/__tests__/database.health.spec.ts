import { HealthIndicatorService } from '@nestjs/terminus';
import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';

import { type DataSource } from 'typeorm';

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
        down: jest.fn().mockImplementation((data) => ({
          database: { status: 'down', ...data },
        })),
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseHealthIndicator,
        {
          provide: getDataSourceToken(),
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
    expect(result.database.details.system.version).toBe('PostgreSQL 15.6');
    expect(result.database.details.system.timestamp).toBeDefined();
    expect(result.database.details.connections).toEqual({
      active: 5,
      max: 100,
      utilizationPercent: 5,
    });
    expect(result.database.details.performance).toEqual({
      cacheHitRatio: '96%',
      deadlocks: 0,
      slowQueries: 0,
    });
    expect(result.database.details.databaseSize).toBe('1 GB');
    expect(result.database.details.top10Tables).toEqual([{ table_stats: [] }]);
  });

  it('should return down status when database fails', async () => {
    dataSource.query.mockRejectedValueOnce(
      new Error(HEALTH_ERROR_MESSAGES.DATABASE_CONNECTION_FAILED),
    );

    const result = await service.isHealthy();

    expect(result.database.status).toBe('down');
    expect(result.database.message).toBe(
      HEALTH_ERROR_MESSAGES.DATABASE_CONNECTION_FAILED,
    );
    expect(result.database.details.system.timestamp).toBeDefined();
    expect(result.database.details.stateHistory).toBeDefined();
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
    expect(result.database.message).toBe(
      HEALTH_ERROR_MESSAGES.DATABASE_TIMEOUT,
    );
    expect(result.database.details.stateHistory).toBeDefined();
  });

  it('should maintain state history across health checks', async () => {
    // First check - healthy state
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

    const firstResult = await service.isHealthy();

    expect(firstResult.database.status).toBe('up');

    // Second check - error state
    dataSource.query.mockRejectedValueOnce(
      new Error(HEALTH_ERROR_MESSAGES.DATABASE_CONNECTION_FAILED),
    );

    const result = await service.isHealthy();

    expect(result.database.details.stateHistory).toMatchObject({
      age: expect.any(Number),
      timestamp: expect.any(Date),
      details: {
        system: {
          version: 'PostgreSQL 15.6',
          timestamp: expect.any(String),
          uptime: expect.any(String),
        },
        connections: {
          active: 5,
          max: 100,
          utilizationPercent: 5,
        },
        performance: {
          cacheHitRatio: '96%',
          deadlocks: 0,
          slowQueries: 0,
        },
        databaseSize: '1 GB',
        top10Tables: [{ table_stats: [] }],
      },
    });
  });
});
