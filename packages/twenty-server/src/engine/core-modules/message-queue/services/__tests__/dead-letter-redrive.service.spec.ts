import { Queue } from 'bullmq';

import { BullMQDriver } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import { DeadLetterRedriveService } from 'src/engine/core-modules/message-queue/services/dead-letter-redrive.service';
import {
  MessageQueue,
} from 'src/engine/core-modules/message-queue/message-queue.constants';

jest.mock('bullmq', () => {
  const mockAdd = jest.fn().mockResolvedValue(undefined);
  const mockGetJobs = jest.fn();
  const mockRemove = jest.fn().mockResolvedValue(undefined);

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

describe('DeadLetterRedriveService', () => {
  let service: DeadLetterRedriveService;
  let bullMqDriver: BullMQDriver;
  let mockQueue: jest.Mocked<Queue>;
  const queueName = MessageQueue.taskAssignedQueue;

  const createFailedJob = (overrides: Partial<any> = {}) => ({
    id: 'job-1',
    name: 'my-job',
    data: { workspaceId: 'ws-1' },
    opts: { jobId: 'original-job-id' },
    remove: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    bullMqDriver = new BullMQDriver(
      {} as any,
      {} as any,
      {} as any,
    );

    bullMqDriver.register(queueName);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    mockQueue = (Queue as unknown as jest.Mock).mock.results[0]?.value;

    service = new DeadLetterRedriveService(bullMqDriver);
  });

  describe('redrive', () => {
    it('should re-enqueue a failed job with the original job id as idempotencyKey', async () => {
      const failedJob = createFailedJob();
      mockQueue.getJobs.mockResolvedValue([failedJob]);

      await service.redrive({ queueName });

      // Verify re-add was called through bullMqDriver.add() with idempotencyKey
      // set to the original failed job id, which the driver converts to jobId
      // for BullMQ native dedup.
      expect(mockQueue.add).toHaveBeenCalledTimes(1);
      expect(mockQueue.add).toHaveBeenCalledWith(
        'my-job',
        { workspaceId: 'ws-1' },
        expect.objectContaining({
          jobId: 'job-1',
        }),
      );

      // Verify the failed entry was removed
      expect(failedJob.remove).toHaveBeenCalledTimes(1);
    });

    it('should filter by jobName when specified', async () => {
      const matchingJob = createFailedJob({ id: 'job-1', name: 'my-job' });
      const nonMatchingJob = createFailedJob({ id: 'job-2', name: 'other-job' });
      mockQueue.getJobs.mockResolvedValue([matchingJob, nonMatchingJob]);

      await service.redrive({ queueName, jobName: 'my-job' });

      expect(mockQueue.add).toHaveBeenCalledTimes(1);
      expect(mockQueue.add).toHaveBeenCalledWith(
        'my-job',
        expect.any(Object),
        expect.any(Object),
      );
      expect(matchingJob.remove).toHaveBeenCalledTimes(1);
      expect(nonMatchingJob.remove).not.toHaveBeenCalled();
    });

    it('should respect the limit parameter', async () => {
      const jobs = [
        createFailedJob({ id: 'job-1' }),
        createFailedJob({ id: 'job-2' }),
        createFailedJob({ id: 'job-3' }),
      ];
      mockQueue.getJobs.mockResolvedValue(jobs);

      await service.redrive({ queueName, limit: 2 });

      expect(mockQueue.add).toHaveBeenCalledTimes(2);
      expect(jobs[0].remove).toHaveBeenCalledTimes(1);
      expect(jobs[1].remove).toHaveBeenCalledTimes(1);
      expect(jobs[2].remove).not.toHaveBeenCalled();
    });

    it('should be idempotent: calling redrive twice re-adds with the same jobId (BullMQ dedup handles the second)', async () => {
      const failedJob = createFailedJob({ id: 'job-1' });
      mockQueue.getJobs.mockResolvedValue([failedJob]);

      await service.redrive({ queueName });
      await service.redrive({ queueName });

      // Each redrive call finds the same failed job and re-adds it.
      // Both calls use the same idempotencyKey ('job-1'), which the driver
      // maps to the same jobId, so BullMQ dedupes the duplicate.
      expect(mockQueue.add).toHaveBeenCalledTimes(2);
      expect(mockQueue.add).toHaveBeenNthCalledWith(
        1,
        'my-job',
        { workspaceId: 'ws-1' },
        expect.objectContaining({ jobId: 'job-1' }),
      );
      expect(mockQueue.add).toHaveBeenNthCalledWith(
        2,
        'my-job',
        { workspaceId: 'ws-1' },
        expect.objectContaining({ jobId: 'job-1' }),
      );
      expect(failedJob.remove).toHaveBeenCalledTimes(2);
    });

    it('should throw an error when BullMQ driver is not available', async () => {
      const syncService = new DeadLetterRedriveService(undefined);

      await expect(syncService.redrive({ queueName })).rejects.toThrow(
        'DeadLetterRedriveService requires BullMQ driver',
      );
    });
  });
});
