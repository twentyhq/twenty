import { HealthIndicatorService } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { Redis } from 'ioredis';

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
            error,
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
        'used_memory_human:1.2G\nused_memory_peak_human:1.5G\nmem_fragmentation_ratio:1.5\n',
      )
      .mockResolvedValueOnce('connected_clients:5\n')
      .mockResolvedValueOnce(
        'total_connections_received:100\nkeyspace_hits:90\nkeyspace_misses:10\n',
      );

    const result = await service.isHealthy();

    expect(result.redis.status).toBe('up');
    expect(result.redis.details).toBeDefined();
    expect(result.redis.details.version).toBe('7.0.0');
  });

  it('should return down status when redis fails', async () => {
    mockRedis.ping.mockRejectedValueOnce(
      new Error(HEALTH_ERROR_MESSAGES.REDIS_CONNECTION_FAILED),
    );

    const result = await service.isHealthy();

    expect(result.redis.status).toBe('down');
    expect(result.redis.error).toBe(
      HEALTH_ERROR_MESSAGES.REDIS_CONNECTION_FAILED,
    );
  });

  it('should timeout after specified duration', async () => {
    mockRedis.ping.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(resolve, HEALTH_INDICATORS_TIMEOUT + 100),
        ),
    );

    const healthCheckPromise = service.isHealthy();

    jest.advanceTimersByTime(HEALTH_INDICATORS_TIMEOUT + 1);

    const result = await healthCheckPromise;

    expect(result.redis.status).toBe('down');
    expect(result.redis.error).toBe(HEALTH_ERROR_MESSAGES.REDIS_TIMEOUT);
  });

  it('should handle partial failures in health details collection', async () => {
    mockRedis.info
      .mockResolvedValueOnce('redis_version:7.0.0') // info
      .mockResolvedValueOnce('used_memory_human:1.2G') // memory
      .mockResolvedValueOnce('connected_clients:5') // clients
      .mockResolvedValueOnce('total_connections_received:100'); // stats

    const result = await service.isHealthy();

    expect(result.redis.status).toBe('up');
    expect(result.redis.details).toBeDefined();
    expect(result.redis.details.version).toBe('7.0.0');
  });
});
