import { Test, TestingModule } from '@nestjs/testing';
import IORedis from 'ioredis';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

jest.mock('ioredis');

describe('RedisClientService', () => {
  let service: RedisClientService;
  let configService: jest.Mocked<TwentyConfigService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisClientService,
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RedisClientService>(RedisClientService);
    configService = module.get(TwentyConfigService);
  });

  it('should initialize IORedis with URL for TCP connections', () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'REDIS_URL') return 'redis://localhost:6379';
      return null;
    });

    service.getClient();

    expect(IORedis).toHaveBeenCalledWith('redis://localhost:6379', {
      maxRetriesPerRequest: null,
    });
  });

  it('should initialize IORedis with path options for unix domain socket URLs', () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'REDIS_URL') return 'unix:///var/run/redis/redis.sock?db=1';
      return null;
    });

    service.getClient();

    expect(IORedis).toHaveBeenCalledWith({
      path: '/var/run/redis/redis.sock',
      db: 1,
      maxRetriesPerRequest: null,
    });
  });

  it('should initialize queue client with separate REDIS_QUEUE_URL when unix socket', () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'REDIS_QUEUE_URL') return 'unix:///tmp/redis-queue.sock';
      if (key === 'REDIS_URL') return 'redis://localhost:6379';
      return null;
    });

    service.getQueueClient();

    expect(IORedis).toHaveBeenCalledWith({
      path: '/tmp/redis-queue.sock',
      maxRetriesPerRequest: null,
    });
  });
});
