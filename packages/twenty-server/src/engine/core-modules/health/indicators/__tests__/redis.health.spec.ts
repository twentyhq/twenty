import { HealthIndicatorService } from '@nestjs/terminus';
import { Test, type TestingModule } from '@nestjs/testing';

import { type Redis } from 'ioredis';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { HEALTH_INDICATORS_TIMEOUT } from 'src/engine/core-modules/health/constants/health-indicators-timeout.conts';
import { RedisHealthIndicator } from 'src/engine/core-modules/health/indicators/redis.health';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

describe('RedisHealthIndicator', () => {
  let service: RedisHealthIndicator;
  let mockRedis: jest.Mocked<
    Pick<Redis, 'ping' | 'info' | 'dbsize' | 'memory'>
  >;
  let healthIndicatorService: jest.Mocked<HealthIndicatorService>;

  beforeEach(async () => {
    mockRedis = {
      ping: jest.fn(),
      info: jest.fn(),
      dbsize: jest.fn(),
      memory: jest.fn(),
    };

    const mockRedisService = {
      getClient: () => mockRedis,
    } as unknown as RedisClientService;

    healthIndicatorService = {
      check: jest.fn().mockReturnValue({
        up: jest.fn().mockImplementation((data) => ({
          redis: { status: 'up', ...data },
        })),
        down: jest.fn().mockImplementation((error) => ({
          redis: {
            status: 'down',
            ...error,
          },
        })),
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisHealthIndicator,
        {
          provide: RedisClientService,
          useValue: mockRedisService,
        },
        {
          provide: HealthIndicatorService,
          useValue: healthIndicatorService,
        },
      ],
    }).compile();

    service = module.get<RedisHealthIndicator>(RedisHealthIndicator);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return up status with details when redis responds', async () => {
    // ai generated mock
    mockRedis.info
      .mockResolvedValueOnce('redis_version:7.0.0\r\n')
      .mockResolvedValueOnce(
        'used_memory_human:1.2G\r\nused_memory_peak_human:1.5G\r\nmem_fragmentation_ratio:1.5\r\n',
      )
      .mockResolvedValueOnce('connected_clients:5\r\n')
      .mockResolvedValueOnce(
        'total_connections_received:100\r\nkeyspace_hits:90\r\nkeyspace_misses:10\r\n',
      );

    const result = await service.isHealthy();

    expect(result.redis.status).toBe('up');
    expect(result.redis.details).toBeDefined();
    expect(result.redis.details.system.version).toBe('7.0.0');
    expect(result.redis.details.system.timestamp).toBeDefined();
    expect(result.redis.details.memory).toEqual({
      used: '1.2G',
      peak: '1.5G',
      fragmentation: 1.5,
    });
  });

  it('should return down status when redis fails', async () => {
    mockRedis.info.mockRejectedValueOnce(
      new Error(HEALTH_ERROR_MESSAGES.REDIS_CONNECTION_FAILED),
    );

    const result = await service.isHealthy();

    expect(result.redis.status).toBe('down');
    expect(result.redis.message).toBe(
      HEALTH_ERROR_MESSAGES.REDIS_CONNECTION_FAILED,
    );
    expect(result.redis.details.system.timestamp).toBeDefined();
    expect(result.redis.details.stateHistory).toBeDefined();
  });

  it('should timeout after specified duration', async () => {
    mockRedis.info.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(resolve, HEALTH_INDICATORS_TIMEOUT + 100),
        ),
    );

    const healthCheckPromise = service.isHealthy();

    jest.advanceTimersByTime(HEALTH_INDICATORS_TIMEOUT + 1);
    const result = await healthCheckPromise;

    expect(result.redis.status).toBe('down');
    expect(result.redis.message).toBe(HEALTH_ERROR_MESSAGES.REDIS_TIMEOUT);
    expect(result.redis.details.system.timestamp).toBeDefined();
    expect(result.redis.details.stateHistory).toBeDefined();
  });

  it('should maintain state history across health checks', async () => {
    // First check - healthy state
    mockRedis.info
      .mockResolvedValueOnce('redis_version:7.0.0\r\n')
      .mockResolvedValueOnce(
        'used_memory_human:1.2G\r\nused_memory_peak_human:1.5G\r\nmem_fragmentation_ratio:1.5\r\n',
      )
      .mockResolvedValueOnce('connected_clients:5\r\n')
      .mockResolvedValueOnce(
        'total_connections_received:100\r\nkeyspace_hits:90\r\nkeyspace_misses:10\r\n',
      );

    await service.isHealthy();

    // Second check - error state
    mockRedis.info.mockRejectedValueOnce(
      new Error(HEALTH_ERROR_MESSAGES.REDIS_CONNECTION_FAILED),
    );

    const result = await service.isHealthy();

    expect(result.redis.details.stateHistory).toBeDefined();
    expect(result.redis.details.stateHistory.age).toBeDefined();
    expect(result.redis.details.stateHistory.timestamp).toBeDefined();
    expect(result.redis.details.stateHistory.details).toBeDefined();
  });
});
