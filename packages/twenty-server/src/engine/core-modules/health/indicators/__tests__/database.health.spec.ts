import { Test, TestingModule } from '@nestjs/testing';

import { DataSource } from 'typeorm';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { HEALTH_INDICATORS_TIMEOUT } from 'src/engine/core-modules/health/constants/health-indicators-timeout.conts';
import { DatabaseHealthIndicator } from 'src/engine/core-modules/health/indicators/database.health';

describe('DatabaseHealthIndicator', () => {
  let service: DatabaseHealthIndicator;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    dataSource = {
      query: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseHealthIndicator,
        {
          provide: 'coreDataSource',
          useValue: dataSource,
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

  it('should return up status when database responds', async () => {
    dataSource.query.mockResolvedValueOnce([]);

    const result = await service.isHealthy('database');

    expect(result.database.status).toBe('up');
  });

  it('should return down status when database fails', async () => {
    dataSource.query.mockRejectedValueOnce(
      new Error(HEALTH_ERROR_MESSAGES.DATABASE_CONNECTION_FAILED),
    );

    const result = await service.isHealthy('database');

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

    const healthCheckPromise = service.isHealthy('database');

    jest.advanceTimersByTime(HEALTH_INDICATORS_TIMEOUT + 1);

    const result = await healthCheckPromise;

    expect(result.database.status).toBe('down');
    expect(result.database.error).toBe('Database timeout');
  });
});
