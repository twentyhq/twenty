import { type JobsOptions, Queue } from 'bullmq';
import { v4 } from 'uuid';

import { BullMQDriver } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  MESSAGE_QUEUE_PRIORITY,
} from 'src/engine/core-modules/message-queue/message-queue-priority.constant';

jest.mock('bullmq', () => {
  const mockAdd = jest.fn().mockResolvedValue(undefined);
  const mockGetJobs = jest.fn().mockResolvedValue([]);

  return {
    Queue: jest.fn().mockImplementation(() => ({
      add: mockAdd,
      getJobs: mockGetJobs,
      close: jest.fn(),
    })),
    Worker: jest.fn(),
    MetricsTime: { ONE_WEEK: 604800 },
  };
});

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'),
}));

describe('BullMQDriver - idempotency keys', () => {
  let driver: BullMQDriver;
  let mockQueue: jest.Mocked<Queue>;
  const queueName = MessageQueue.taskAssignedQueue;

  beforeEach(async () => {
    jest.clearAllMocks();

    driver = new BullMQDriver(
      {} as any,
      {} as any,
      {} as any,
    );

    driver.register(queueName);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    mockQueue = (Queue as unknown as jest.Mock).mock.results[0]?.value;
  });

  describe('with idempotencyKey', () => {
    it('should pass idempotencyKey verbatim as jobId', async () => {
      await driver.add(queueName, 'test-job', { foo: 'bar' }, {
        idempotencyKey: 'my-idempotency-key',
      });

      expect(mockQueue.add).toHaveBeenCalledTimes(1);
      expect(mockQueue.add).toHaveBeenCalledWith(
        'test-job',
        { foo: 'bar' },
        expect.objectContaining({
          jobId: 'my-idempotency-key',
        } satisfies Partial<JobsOptions>),
      );
    });

    it('should skip the waiting-job guard (should not call getJobs)', async () => {
      await driver.add(queueName, 'test-job', { foo: 'bar' }, {
        idempotencyKey: 'my-key',
        id: 'some-id', // this would trigger the guard if idempotencyKey was not set
      });

      expect(mockQueue.getJobs).not.toHaveBeenCalled();
    });

    it('should be idempotent: two add() calls with same idempotencyKey produce same jobId', async () => {
      await driver.add(queueName, 'test-job', { foo: 'bar' }, {
        idempotencyKey: 'dedup-key',
      });

      await driver.add(queueName, 'test-job', { foo: 'bar' }, {
        idempotencyKey: 'dedup-key',
      });

      // Both calls use the same jobId; BullMQ natively dedupes
      expect(mockQueue.add).toHaveBeenCalledTimes(2);
      expect(mockQueue.add).toHaveBeenNthCalledWith(
        1,
        'test-job',
        { foo: 'bar' },
        expect.objectContaining({ jobId: 'dedup-key' }),
      );
      expect(mockQueue.add).toHaveBeenNthCalledWith(
        2,
        'test-job',
        { foo: 'bar' },
        expect.objectContaining({ jobId: 'dedup-key' }),
      );
    });

    it('should set correct priority, attempts, and retention options', async () => {
      await driver.add(queueName, 'test-job', {}, {
        idempotencyKey: 'key-1',
        priority: 5,
        retryLimit: 2,
        delay: 1000,
      });

      expect(mockQueue.add).toHaveBeenCalledWith(
        'test-job',
        {},
        expect.objectContaining({
          jobId: 'key-1',
          priority: 5,
          attempts: 3, // 1 + retryLimit(2)
          delay: 1000,
        }),
      );
    });
  });

  describe('without idempotencyKey (legacy path)', () => {
    it('should still append v4() suffix when options.id is set', async () => {
      await driver.add(queueName, 'test-job', { foo: 'bar' }, {
        id: 'my-id',
      });

      expect(mockQueue.add).toHaveBeenCalledWith(
        'test-job',
        { foo: 'bar' },
        expect.objectContaining({
          jobId: 'my-id-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        }),
      );
    });

    it('should call the waiting-job guard when options.id is set', async () => {
      await driver.add(queueName, 'test-job', { foo: 'bar' }, {
        id: 'my-id',
      });

      expect(mockQueue.getJobs).toHaveBeenCalledWith(['waiting']);
    });

    it('should set jobId to undefined when no options.id is set', async () => {
      await driver.add(queueName, 'test-job', { foo: 'bar' });

      expect(mockQueue.add).toHaveBeenCalledWith(
        'test-job',
        { foo: 'bar' },
        expect.objectContaining({
          jobId: undefined,
        }),
      );
    });
  });
});
