import { HealthIndicatorService } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { Queue } from 'bullmq';
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
  getMetrics: jest.fn().mockResolvedValue({}),
};

jest.mock('bullmq', () => ({
  Queue: jest.fn(() => mockQueueInstance),
}));

describe('WorkerHealthIndicator', () => {
  let service: WorkerHealthIndicator;
  let mockRedis: jest.Mocked<Pick<Redis, 'ping'>>;
  let healthIndicatorService: jest.Mocked<HealthIndicatorService>;
  let loggerSpy: jest.SpyInstance;

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

    loggerSpy = jest
      .spyOn(service['logger'], 'error')
      .mockImplementation(() => {});
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
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

  it('should return down status when failure rate exceeds threshold', async () => {
    mockQueueInstance.getWorkers.mockResolvedValue([{ id: 'worker1' }]);
    mockQueueInstance.getMetrics.mockImplementation((type) => {
      if (type === 'failed') {
        return Promise.resolve({ count: 600 });
      }
      if (type === 'completed') {
        return Promise.resolve({ count: 400 });
      }

      return Promise.resolve({ count: 0 });
    });
    mockQueueInstance.getWaitingCount.mockResolvedValue(0);
    mockQueueInstance.getActiveCount.mockResolvedValue(0);
    mockQueueInstance.getDelayedCount.mockResolvedValue(0);

    (Queue as jest.MockedClass<typeof Queue>).mockClear();
    mockQueueInstance.getWorkers.mockClear();
    mockQueueInstance.getMetrics.mockClear();

    const result = await service.isHealthy();

    expect(Queue).toHaveBeenCalledTimes(Object.keys(MessageQueue).length);

    expect(result.worker.status).toBe('up');
    expect('queues' in result.worker).toBe(true);
    if ('queues' in result.worker) {
      expect(result.worker.queues[0].status).toBe('down');
      expect(result.worker.queues[0].metrics).toEqual({
        failed: 600,
        completed: 400,
        waiting: 0,
        active: 0,
        delayed: 0,
        failureRate: 60,
      });
    }

    expect(mockQueueInstance.getMetrics).toHaveBeenCalledWith(
      'failed',
      0,
      undefined,
    );
    expect(mockQueueInstance.getMetrics).toHaveBeenCalledWith(
      'completed',
      0,
      undefined,
    );
  });

  it('should return complete metrics for active workers', async () => {
    mockQueueInstance.getWorkers.mockResolvedValue([{ id: 'worker1' }]);
    mockQueueInstance.getMetrics.mockImplementation((type) => {
      if (type === 'failed') {
        return Promise.resolve({ count: 10 });
      }
      if (type === 'completed') {
        return Promise.resolve({ count: 90 });
      }

      return Promise.resolve({ count: 0 });
    });
    mockQueueInstance.getWaitingCount.mockResolvedValue(5);
    mockQueueInstance.getActiveCount.mockResolvedValue(2);
    mockQueueInstance.getDelayedCount.mockResolvedValue(1);

    const result = await service.isHealthy();

    expect(result.worker.status).toBe('up');
    expect('queues' in result.worker).toBe(true);
    if ('queues' in result.worker) {
      expect(result.worker.queues[0].metrics).toEqual({
        failed: 10,
        completed: 90,
        waiting: 5,
        active: 2,
        delayed: 1,
        failureRate: 10,
      });
    }
  });

  it('should handle queue errors gracefully', async () => {
    mockQueueInstance.getWorkers.mockRejectedValue(new Error('Queue error'));
    mockQueueInstance.getMetrics.mockRejectedValue(new Error('Queue error'));
    mockQueueInstance.getWaitingCount.mockRejectedValue(
      new Error('Queue error'),
    );
    mockQueueInstance.getActiveCount.mockRejectedValue(
      new Error('Queue error'),
    );
    mockQueueInstance.getDelayedCount.mockRejectedValue(
      new Error('Queue error'),
    );

    const result = await service.isHealthy();

    expect(result.worker.status).toBe('down');
    expect('error' in result.worker).toBe(true);
    if ('error' in result.worker) {
      expect(result.worker.error).toBe(HEALTH_ERROR_MESSAGES.NO_ACTIVE_WORKERS);
    }

    expect(loggerSpy).toHaveBeenCalled();
    Object.values(MessageQueue).forEach((queueName) => {
      expect(loggerSpy).toHaveBeenCalledWith(
        `Error getting queue details for ${queueName}: Queue error`,
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        `Error checking worker for queue ${queueName}: Queue error`,
      );
    });
  });
});
