import { Test, TestingModule } from '@nestjs/testing';

import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { HEALTH_INDICATORS_TIMEOUT } from 'src/engine/core-modules/health/constants/health-indicators-timeout.conts';
import { HealthServiceStatus } from 'src/engine/core-modules/health/enums/health-service-status.enum';
import { WorkerHealthIndicator } from 'src/engine/core-modules/health/indicators/worker.health';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

jest.mock('bullmq', () => ({
  Queue: jest.fn(),
}));

describe('WorkerHealthIndicator', () => {
  let service: WorkerHealthIndicator;
  let mockRedis: jest.Mocked<Pick<Redis, 'ping'>>;
  let mockQueue: jest.Mocked<Pick<Queue, 'getWorkers' | 'close'>>;

  beforeEach(async () => {
    mockRedis = {
      ping: jest.fn(),
    };

    mockQueue = {
      getWorkers: jest.fn(),
      close: jest.fn(),
    };

    (Queue as unknown as jest.Mock).mockImplementation(() => mockQueue);

    const mockRedisService = {
      getClient: () => mockRedis,
    } as unknown as RedisClientService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkerHealthIndicator,
        {
          provide: RedisClientService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<WorkerHealthIndicator>(WorkerHealthIndicator);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return operational status when all queues have workers', async () => {
    mockQueue.getWorkers.mockResolvedValue([{ id: 'worker1' }] as any);

    const result = await service.isHealthy();

    expect(result.worker.status).toBe('up');
    expect(result.worker.queues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          workers: 1,
          status: HealthServiceStatus.OPERATIONAL,
        }),
      ]),
    );
  });

  it('should return up status when some queues have no workers', async () => {
    Object.values(MessageQueue).forEach((_, index) => {
      mockQueue.getWorkers.mockResolvedValueOnce(
        index === 0 ? ([{ id: 'worker1' }] as any) : [],
      );
    });

    const result = await service.isHealthy();

    expect(result.worker.status).toBe('up');
    expect(result.worker.queues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          workers: 1,
          status: HealthServiceStatus.OPERATIONAL,
        }),
        expect.objectContaining({
          workers: 0,
          status: HealthServiceStatus.OUTAGE,
        }),
      ]),
    );
  });

  it('should return down status when no queues have workers', async () => {
    mockQueue.getWorkers.mockResolvedValue([]);

    const result = await service.isHealthy();

    expect(result.worker.status).toBe('down');
    expect(result.worker.error).toBe(HEALTH_ERROR_MESSAGES.NO_ACTIVE_WORKERS);
  });

  it('should timeout after specified duration', async () => {
    mockQueue.getWorkers.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(resolve, HEALTH_INDICATORS_TIMEOUT + 100),
        ),
    );

    const healthCheckPromise = service.isHealthy();

    jest.advanceTimersByTime(HEALTH_INDICATORS_TIMEOUT + 1);
    const result = await healthCheckPromise;

    expect(result.worker.status).toBe('down');
    expect(result.worker.error).toBe(HEALTH_ERROR_MESSAGES.WORKER_TIMEOUT);
  });

  it('should check all message queues', async () => {
    mockQueue.getWorkers.mockResolvedValue([{ id: 'worker1' }] as any);

    await service.isHealthy();

    expect(Queue).toHaveBeenCalledTimes(Object.keys(MessageQueue).length);
    expect(mockQueue.close).toHaveBeenCalledTimes(
      Object.keys(MessageQueue).length,
    );
  });
});
