import { type Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';

import { JOB_MEMORY_CHARGE_TTL_SECONDS } from 'src/engine/core-modules/message-queue/constants/job-memory-limit.constant';
import { JobMemoryLimiter } from 'src/engine/core-modules/message-queue/drivers/memory/job-memory-limiter';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  MessageQueueException,
  MessageQueueExceptionCode,
} from 'src/engine/core-modules/message-queue/message-queue.exception';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

const QUEUE = MessageQueue.logicFunctionQueue;
const KEY_PREFIX = 'bull';
const WORKSPACE_1 = 'workspace:ws-1';
const WORKSPACE_2 = 'workspace:ws-2';
const APPLICATION = 'application:app-1';

const usedKeyOf = (groupKey: string) => `${KEY_PREFIX}:jobmem:used:${groupKey}`;
const jobsKeyOf = (groupKey: string) => `${KEY_PREFIX}:jobmem:jobs:${groupKey}`;

const createLimiter = async ({
  isEnabled = true,
  maxMemoryBytes = 10_000,
  usedMemoryBytes = 0,
  share = 0.1,
  reserve = 0,
}: {
  isEnabled?: boolean;
  maxMemoryBytes?: number;
  usedMemoryBytes?: number;
  share?: number;
  reserve?: number;
} = {}) => {
  const redis: Redis = new RedisMock();

  await redis.flushall();

  const memoryInfo = { usedMemoryBytes, maxMemoryBytes };
  const client = {
    runCommand: async (name: string, args: (string | number)[]) => {
      if (name === 'info') {
        return `# Memory\r\nused_memory:${memoryInfo.usedMemoryBytes}\r\nmaxmemory:${memoryInfo.maxMemoryBytes}\r\n`;
      }

      const [script, numberOfKeys, ...scriptArguments] = args;

      if (name === 'evalsha') {
        return redis.evalsha(
          String(script),
          Number(numberOfKeys),
          ...scriptArguments,
        );
      }

      return redis.eval(
        String(script),
        Number(numberOfKeys),
        ...scriptArguments,
      );
    },
  };
  const metricsService = { incrementCounterForEvent: jest.fn() };
  const limiter = new JobMemoryLimiter({
    getClient: async () => client as never,
    keyPrefix: KEY_PREFIX,
    metricsService: metricsService as never,
    isEnabled: () => isEnabled,
    getShare: () => share,
    getReserve: () => reserve,
  });

  return { redis, limiter, metricsService };
};

const readUsedBytes = async ({
  redis,
  groupKey,
}: {
  redis: Redis;
  groupKey: string;
}) => Number((await redis.get(usedKeyOf(groupKey))) ?? 0);

describe('JobMemoryLimiter', () => {
  it('charges every group key of a job and returns the smallest headroom', async () => {
    const { redis, limiter } = await createLimiter();

    const admission = await limiter.admit({
      queueName: QUEUE,
      jobs: [
        {
          jobId: 'job-1',
          sizeBytes: 300,
          groupKeys: [WORKSPACE_1, APPLICATION],
        },
      ],
    });

    expect(admission).toEqual({ isCharged: true, availableBytes: 700 });
    expect(await readUsedBytes({ redis, groupKey: WORKSPACE_1 })).toBe(300);
    expect(await readUsedBytes({ redis, groupKey: APPLICATION })).toBe(300);
    expect(
      Number(await redis.hget(jobsKeyOf(WORKSPACE_1), `${QUEUE}:job-1`)),
    ).toBe(300);
  });

  it('does not charge the system group key', async () => {
    const { redis, limiter } = await createLimiter();

    const admission = await limiter.admit({
      queueName: QUEUE,
      jobs: [{ jobId: 'job-1', sizeBytes: 300, groupKeys: ['system'] }],
    });

    expect(admission).toEqual({ isCharged: false, availableBytes: null });
    expect(await redis.keys('*')).toEqual([]);
  });

  it('charges a duplicate job id only once', async () => {
    const { redis, limiter } = await createLimiter();
    const job = { jobId: 'job-1', sizeBytes: 300, groupKeys: [WORKSPACE_1] };

    await limiter.admit({ queueName: QUEUE, jobs: [job] });
    await limiter.admit({ queueName: QUEUE, jobs: [job, job] });

    expect(await readUsedBytes({ redis, groupKey: WORKSPACE_1 })).toBe(300);
  });

  it('refuses the whole batch without charging it', async () => {
    const { redis, limiter, metricsService } = await createLimiter({
      usedMemoryBytes: 600,
    });

    await limiter.admit({
      queueName: QUEUE,
      jobs: [{ jobId: 'job-1', sizeBytes: 600, groupKeys: [WORKSPACE_1] }],
    });

    const refusal = limiter.admit({
      queueName: QUEUE,
      jobs: [
        { jobId: 'job-2', sizeBytes: 200, groupKeys: [WORKSPACE_1] },
        { jobId: 'job-3', sizeBytes: 300, groupKeys: [WORKSPACE_1] },
      ],
    });

    await expect(refusal).rejects.toBeInstanceOf(MessageQueueException);
    await expect(refusal).rejects.toMatchObject({
      code: MessageQueueExceptionCode.JOB_QUEUE_MEMORY_LIMIT_REACHED,
      statusCode: 429,
      details: { requestedBytes: 500, availableBytes: 400 },
    });
    expect(metricsService.incrementCounterForEvent).toHaveBeenCalledTimes(1);
    expect(await readUsedBytes({ redis, groupKey: WORKSPACE_1 })).toBe(600);
    expect(await redis.hexists(jobsKeyOf(WORKSPACE_1), `${QUEUE}:job-2`)).toBe(
      0,
    );
    expect(metricsService.incrementCounterForEvent).toHaveBeenCalledWith({
      key: MetricsKeys.JobMemoryLimitRefused,
      attributes: { queue: QUEUE, reason: 'share' },
      shouldStoreInCache: false,
    });
  });

  it('admits a batch within the limit', async () => {
    const { limiter } = await createLimiter();

    const admission = await limiter.admit({
      queueName: QUEUE,
      jobs: [{ jobId: 'job-1', sizeBytes: 400, groupKeys: [WORKSPACE_1] }],
    });

    expect(admission).toEqual({ isCharged: true, availableBytes: 600 });
  });

  it('admits when Redis cannot be reached', async () => {
    const brokenLimiter = new JobMemoryLimiter({
      getClient: async () =>
        ({
          runCommand: async (name: string) =>
            name === 'info'
              ? 'used_memory:0\r\nmaxmemory:10000\r\n'
              : Promise.reject(new Error('connection lost')),
        }) as never,
      keyPrefix: KEY_PREFIX,
      metricsService: { incrementCounterForEvent: jest.fn() } as never,
      isEnabled: () => true,
      getShare: () => 0.1,
      getReserve: () => 0,
    });

    await expect(
      brokenLimiter.admit({
        queueName: QUEUE,
        jobs: [{ jobId: 'job-1', sizeBytes: 5_000, groupKeys: [WORKSPACE_1] }],
      }),
    ).resolves.toEqual({ isCharged: false, availableBytes: null });
  });

  it('admits a second tenant while the first one is at its limit', async () => {
    const { limiter, metricsService } = await createLimiter({
      usedMemoryBytes: 1_000,
    });

    await limiter.admit({
      queueName: QUEUE,
      jobs: [{ jobId: 'job-1', sizeBytes: 900, groupKeys: [WORKSPACE_1] }],
    });
    metricsService.incrementCounterForEvent.mockClear();

    const admission = await limiter.admit({
      queueName: QUEUE,
      jobs: [{ jobId: 'job-2', sizeBytes: 500, groupKeys: [WORKSPACE_2] }],
    });

    expect(admission.availableBytes).toBe(400);
    expect(metricsService.incrementCounterForEvent).not.toHaveBeenCalled();
  });

  it('releases idempotently', async () => {
    const { redis, limiter } = await createLimiter();
    const groupKeys = [WORKSPACE_1, APPLICATION];

    await limiter.admit({
      queueName: QUEUE,
      jobs: [
        { jobId: 'job-1', sizeBytes: 300, groupKeys },
        { jobId: 'job-2', sizeBytes: 200, groupKeys },
      ],
    });
    await limiter.release({ queueName: QUEUE, jobId: 'job-1', groupKeys });
    await limiter.release({ queueName: QUEUE, jobId: 'job-1', groupKeys });

    expect(await readUsedBytes({ redis, groupKey: WORKSPACE_1 })).toBe(200);
    expect(await readUsedBytes({ redis, groupKey: APPLICATION })).toBe(200);

    await limiter.release({ queueName: QUEUE, jobId: 'job-2', groupKeys });

    expect(await redis.exists(usedKeyOf(WORKSPACE_1))).toBe(0);
  });

  it('ignores the release of a job that was never charged', async () => {
    const { redis, limiter } = await createLimiter();

    await limiter.release({
      queueName: QUEUE,
      jobId: 'unknown',
      groupKeys: [WORKSPACE_1],
    });

    expect(await redis.keys('*')).toEqual([]);
  });

  it('follows the payload size of a charged job', async () => {
    const { redis, limiter } = await createLimiter();
    const groupKeys = [WORKSPACE_1];

    await limiter.admit({
      queueName: QUEUE,
      jobs: [{ jobId: 'job-1', sizeBytes: 300, groupKeys }],
    });
    await limiter.resize({
      queueName: QUEUE,
      jobId: 'job-1',
      groupKeys,
      sizeBytes: 800,
    });

    expect(await readUsedBytes({ redis, groupKey: WORKSPACE_1 })).toBe(800);

    await limiter.resize({
      queueName: QUEUE,
      jobId: 'job-1',
      groupKeys,
      sizeBytes: 100,
    });

    expect(await readUsedBytes({ redis, groupKey: WORKSPACE_1 })).toBe(100);

    await limiter.release({ queueName: QUEUE, jobId: 'job-1', groupKeys });

    expect(await redis.exists(usedKeyOf(WORKSPACE_1))).toBe(0);
  });

  it('expires charges after the charge TTL', async () => {
    const { redis, limiter } = await createLimiter();

    await limiter.admit({
      queueName: QUEUE,
      jobs: [{ jobId: 'job-1', sizeBytes: 300, groupKeys: [WORKSPACE_1] }],
    });

    expect(await redis.ttl(usedKeyOf(WORKSPACE_1))).toBe(
      JOB_MEMORY_CHARGE_TTL_SECONDS,
    );
    expect(await redis.ttl(jobsKeyOf(WORKSPACE_1))).toBe(
      JOB_MEMORY_CHARGE_TTL_SECONDS,
    );
  });

  it.each<{ name: string; options: Parameters<typeof createLimiter>[0] }>([
    { name: 'disabled', options: { isEnabled: false } },
    { name: 'maxmemory is unset', options: { maxMemoryBytes: 0 } },
  ])('does not charge when $name', async ({ options }) => {
    const { redis, limiter } = await createLimiter(options);

    const admission = await limiter.admit({
      queueName: QUEUE,
      jobs: [{ jobId: 'job-1', sizeBytes: 300, groupKeys: [WORKSPACE_1] }],
    });

    expect(admission).toEqual({ isCharged: false, availableBytes: null });
    expect(await redis.keys('*')).toEqual([]);
  });

  it('reports the used ratio of the capacity', async () => {
    const { limiter } = await createLimiter({
      usedMemoryBytes: 4_000,
      reserve: 0.2,
    });

    expect(await limiter.getUsedRatio(QUEUE)).toBe(0.5);
  });
});
