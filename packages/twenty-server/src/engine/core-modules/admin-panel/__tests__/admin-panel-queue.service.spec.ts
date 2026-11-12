import RedisMock from 'ioredis-mock';

import { AdminPanelQueueService } from 'src/engine/core-modules/admin-panel/admin-panel-queue.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

const mockGetJob = jest.fn();
const mockClose = jest.fn();

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    getJob: mockGetJob,
    close: mockClose,
  })),
}));

describe('admin queue deletion memory accounting', () => {
  const queueName = MessageQueue.logicFunctionQueue;
  const groupKeys = ['workspace:workspace-1', 'application:application-1'];
  const member = `${queueName}:job-1`;

  const setup = async () => {
    const redis = new RedisMock();
    await redis.flushall();
    const remove = jest.fn().mockResolvedValue(undefined);
    mockGetJob.mockResolvedValue({
      opts: { memoryGroupKeys: groupKeys },
      remove,
    });
    const service = new AdminPanelQueueService({
      getQueueClient: () => redis,
      getQueuePrefix: () => 'bull',
    } as never);
    for (const groupKey of groupKeys) {
      await redis.set(`bull:jobmem:used:${groupKey}`, 300);
      await redis.hset(`bull:jobmem:jobs:${groupKey}`, member, 300);
    }
    return { redis, remove, service };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('releases workspace and application charges after a successful deletion', async () => {
    const { redis, service, remove } = await setup();
    try {
      const result = await service.deleteJobs(queueName, ['job-1']);
      expect(result).toEqual({
        deletedCount: 1,
        results: [{ jobId: 'job-1', success: true }],
      });
      expect(remove).toHaveBeenCalledTimes(1);
      for (const groupKey of groupKeys) {
        expect(await redis.get(`bull:jobmem:used:${groupKey}`)).toBeNull();
        expect(
          await redis.hget(`bull:jobmem:jobs:${groupKey}`, member),
        ).toBeNull();
      }
      expect(mockClose).toHaveBeenCalledTimes(1);
    } finally {
      redis.disconnect();
    }
  });

  it('keeps reservations when a locked job cannot be removed', async () => {
    const { redis, service, remove } = await setup();
    remove.mockRejectedValue(new Error('Job is locked'));
    try {
      const result = await service.deleteJobs(queueName, ['job-1']);
      expect(result.deletedCount).toBe(0);
      expect(result.results[0].success).toBe(false);
      for (const groupKey of groupKeys) {
        expect(await redis.get(`bull:jobmem:used:${groupKey}`)).toBe('300');
      }
    } finally {
      redis.disconnect();
    }
  });

  it('does not release a reservation belonging to another job', async () => {
    const { redis, service } = await setup();
    mockGetJob.mockResolvedValue({
      opts: { memoryGroupKeys: groupKeys },
      remove: jest.fn().mockResolvedValue(undefined),
    });
    try {
      await service.deleteJobs(queueName, ['job-2']);
      expect(await redis.get('bull:jobmem:used:workspace:workspace-1')).toBe(
        '300',
      );
    } finally {
      redis.disconnect();
    }
  });
  it('reports a completed deletion accurately when reservation cleanup fails', async () => {
    const { redis, service } = await setup();
    jest.spyOn(redis, 'eval').mockRejectedValue(new Error('Redis unavailable'));
    try {
      const result = await service.deleteJobs(queueName, ['job-1']);
      expect(result.deletedCount).toBe(1);
      expect(result.results[0]).toMatchObject({
        jobId: 'job-1',
        success: true,
      });
      expect(result.results[0].error).toContain(
        'memory reservation could not be released',
      );
    } finally {
      redis.disconnect();
    }
  });
});
