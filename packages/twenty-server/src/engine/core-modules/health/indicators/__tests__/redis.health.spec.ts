import { HealthIndicatorService } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { Redis } from 'ioredis';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { HEALTH_INDICATORS_TIMEOUT } from 'src/engine/core-modules/health/constants/health-indicators-timeout.conts';
import { RedisHealthIndicator } from 'src/engine/core-modules/health/indicators/redis.health';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

describe('RedisHealthIndicator', () => {
  let service: RedisHealthIndicator;
  let mockRedis: jest.Mocked<Pick<Redis, 'ping'>>;
  let healthIndicatorService: jest.Mocked<HealthIndicatorService>;

  beforeEach(async () => {
    mockRedis = {
      ping: jest.fn(),
    };

    const mockRedisService = {
      getClient: () => mockRedis,
    } as unknown as RedisClientService;

    healthIndicatorService = {
      check: jest.fn().mockReturnValue({
        up: jest.fn().mockReturnValue({ redis: { status: 'up' } }),
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

  it('should return up status when redis responds', async () => {
    mockRedis.ping.mockResolvedValueOnce('PONG');

    const result = await service.isHealthy();

    expect(result.redis.status).toBe('up');
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
    expect(result.redis.error).toBe('Redis timeout');
  });
});
