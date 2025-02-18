import { HealthIndicatorService } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { Redis } from 'ioredis';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { HEALTH_INDICATORS_TIMEOUT } from 'src/engine/core-modules/health/constants/health-indicators-timeout.conts';
import { WorkerHealthIndicator } from 'src/engine/core-modules/health/indicators/worker.health';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

const mockQueueInstance = {
  getWorkers: jest.fn().mockResolvedValue([]),
  close: jest.fn().mockResolvedValue(undefined),
  getFailedCount: jest.fn().mockResolvedValue(0),
  getCompletedCount: jest.fn().mockResolvedValue(0),
  getWaitingCount: jest.fn().mockResolvedValue(0),
  getActiveCount: jest.fn().mockResolvedValue(0),
  getDelayedCount: jest.fn().mockResolvedValue(0),
  getPrioritizedCount: jest.fn().mockResolvedValue(0),
};

jest.mock('bullmq', () => ({
  Queue: jest.fn(() => mockQueueInstance),
}));

describe('WorkerHealthIndicator', () => {
  let service: WorkerHealthIndicator;
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
        up: jest.fn().mockImplementation((data) => ({
          worker: { status: 'up', ...data },
        })),
        down: jest.fn().mockImplementation((error) => ({
          worker: { status: 'down', error },
        })),
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkerHealthIndicator,
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

    service = module.get<WorkerHealthIndicator>(WorkerHealthIndicator);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return up status when workers are active', async () => {
    mockQueueInstance.getWorkers.mockResolvedValue([{ id: 'worker1' }]);

    const result = await service.isHealthy();

    expect(result.worker.status).toBe('up');
    expect('queues' in result.worker).toBe(true);
    if ('queues' in result.worker) {
      expect(result.worker.queues.length).toBeGreaterThan(0);
    }
  });

  it('should return down status when no workers are active', async () => {
    mockQueueInstance.getWorkers.mockResolvedValue([]);

    const result = await service.isHealthy();

    expect(result.worker.status).toBe('down');
    expect('error' in result.worker).toBe(true);
    if ('error' in result.worker) {
      expect(result.worker.error).toBe(HEALTH_ERROR_MESSAGES.NO_ACTIVE_WORKERS);
    }
  });

  it('should timeout after specified duration', async () => {
    jest.useFakeTimers();
    mockQueueInstance.getWorkers.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(resolve, HEALTH_INDICATORS_TIMEOUT + 100),
        ),
    );

    const resultPromise = service.isHealthy();

    jest.advanceTimersByTime(HEALTH_INDICATORS_TIMEOUT + 200);
    const result = await resultPromise;

    expect(result.worker.status).toBe('down');
    expect('error' in result.worker).toBe(true);
    if ('error' in result.worker) {
      expect(result.worker.error).toBe(HEALTH_ERROR_MESSAGES.WORKER_TIMEOUT);
    }
    jest.useRealTimers();
  });

  it('should check all message queues', async () => {
    mockQueueInstance.getWorkers.mockResolvedValue([{ id: 'worker1' }]);

    await service.isHealthy();

    expect(mockQueueInstance.getWorkers).toHaveBeenCalledTimes(
      Object.keys(MessageQueue).length,
    );
    expect(mockQueueInstance.close).toHaveBeenCalledTimes(
      Object.keys(MessageQueue).length,
    );
  });
});
