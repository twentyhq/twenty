import { type Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';

import { NOT_CHARGED_QUEUES } from 'src/engine/core-modules/message-queue/constants/job-memory-limit.constant';
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

const buildConfig = ({
  isEnabled,
  workspaceShare,
  applicationShare,
  reserve,
}: {
  isEnabled: boolean;
  workspaceShare: number;
  applicationShare: number;
  reserve: number;
}) => {
  const configValues: Record<string, unknown> = {
    IS_REDIS_MEMORY_FAIRNESS_ENABLED: isEnabled,
    JOB_QUEUE_MEMORY_SHARE_BY_WORKSPACE_ID: workspaceShare,
    JOB_QUEUE_MEMORY_SHARE_BY_APPLICATION_UNIVERSAL_IDENTIFIER:
      applicationShare,
    JOB_QUEUE_MEMORY_RESERVE: reserve,
  };

  return { get: (key: string) => configValues[key] } as never;
};

const createLimiter = async ({
  isEnabled = true,
  maxMemoryBytes = 10_000,
  usedMemoryBytes = 0,
  workspaceShare = 0.1,
  applicationShare = 0.4,
  reserve = 0,
}: {
  isEnabled?: boolean;
  maxMemoryBytes?: number;
  usedMemoryBytes?: number;
  workspaceShare?: number;
  applicationShare?: number;
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

      if (name !== 'eval' && name !== 'evalsha') {
        const redisCommands = redis as unknown as Record<
          string,
          (...commandArguments: (string | number)[]) => Promise<unknown>
        >;

        return redisCommands[name](...args);
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
    getJobKey: ({ queueName, jobId }) => `${KEY_PREFIX}:${queueName}:${jobId}`,
    keyPrefix: KEY_PREFIX,
    metricsService: metricsService as never,
    twentyConfigService: buildConfig({
      isEnabled,
      workspaceShare,
      applicationShare,
      reserve,
    }),
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
      jobName: 'job',
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

  it('applies the workspace share to workspace keys and the application share to application keys', async () => {
    const { limiter } = await createLimiter();

    const applicationAdmission = await limiter.admit({
      queueName: QUEUE,
      jobName: 'job',
      jobs: [{ jobId: 'job-1', sizeBytes: 3_000, groupKeys: [APPLICATION] }],
    });

    expect(applicationAdmission).toEqual({
      isCharged: true,
      availableBytes: 1_000,
    });

    await expect(
      limiter.admit({
        queueName: QUEUE,
        jobName: 'job',
        jobs: [{ jobId: 'job-2', sizeBytes: 3_000, groupKeys: [WORKSPACE_1] }],
      }),
    ).rejects.toThrow(MessageQueueException);
  });

  it('counts a job id listed twice in one batch only once against the limit', async () => {
    const { redis, limiter } = await createLimiter();

    const admission = await limiter.admit({
      queueName: QUEUE,
      jobName: 'job',
      jobs: [
        { jobId: 'job-1', sizeBytes: 600, groupKeys: [WORKSPACE_1] },
        { jobId: 'job-1', sizeBytes: 600, groupKeys: [WORKSPACE_1] },
      ],
    });

    expect(admission).toEqual({ isCharged: true, availableBytes: 400 });
    expect(await readUsedBytes({ redis, groupKey: WORKSPACE_1 })).toBe(600);
  });

  it('does not charge the system group key', async () => {
    const { redis, limiter } = await createLimiter();

    const admission = await limiter.admit({
      queueName: QUEUE,
      jobName: 'job',
      jobs: [{ jobId: 'job-1', sizeBytes: 300, groupKeys: ['system'] }],
    });

    expect(admission).toEqual({ isCharged: false, availableBytes: null });
    expect(await redis.keys('*')).toEqual([]);
  });

  it('charges a duplicate job id only once', async () => {
    const { redis, limiter } = await createLimiter();
    const job = { jobId: 'job-1', sizeBytes: 300, groupKeys: [WORKSPACE_1] };

    await limiter.admit({ queueName: QUEUE, jobName: 'job', jobs: [job] });
    await limiter.admit({ queueName: QUEUE, jobName: 'job', jobs: [job, job] });

    expect(await readUsedBytes({ redis, groupKey: WORKSPACE_1 })).toBe(300);
  });

  it('refuses the whole batch without charging it', async () => {
    const { redis, limiter, metricsService } = await createLimiter({
      usedMemoryBytes: 600,
    });

    await limiter.admit({
      queueName: QUEUE,
      jobName: 'job',
      jobs: [{ jobId: 'job-1', sizeBytes: 600, groupKeys: [WORKSPACE_1] }],
    });

    const refusal = limiter.admit({
      queueName: QUEUE,
      jobName: 'job',
      jobs: [
        { jobId: 'job-2', sizeBytes: 200, groupKeys: [WORKSPACE_1] },
        { jobId: 'job-3', sizeBytes: 300, groupKeys: [WORKSPACE_1] },
      ],
    });

    await expect(refusal).rejects.toBeInstanceOf(MessageQueueException);
    await expect(refusal).rejects.toMatchObject({
      code: MessageQueueExceptionCode.JOB_QUEUE_MEMORY_LIMIT_REACHED,
      statusCode: 429,
      details: {
        requestedBytes: 500,
        availableBytes: 400,
        refusedGroupKeys: [WORKSPACE_1],
      },
    });
    expect(metricsService.incrementCounterForEvent).toHaveBeenCalledTimes(1);
    expect(await readUsedBytes({ redis, groupKey: WORKSPACE_1 })).toBe(600);
    expect(await redis.hexists(jobsKeyOf(WORKSPACE_1), `${QUEUE}:job-2`)).toBe(
      0,
    );
    expect(metricsService.incrementCounterForEvent).toHaveBeenCalledWith({
      key: MetricsKeys.JobMemoryLimitRefused,
      attributes: { queue: QUEUE, job_name: 'job', reason: 'share' },
      shouldStoreInCache: false,
    });
  });

  it('lists every workspace over its share when refusing a batch that spans several workspaces', async () => {
    const { redis, limiter } = await createLimiter();
    const WORKSPACE_3 = 'workspace:ws-3';

    const refusal = limiter.admit({
      queueName: QUEUE,
      jobName: 'job',
      jobs: [
        { jobId: 'job-1', sizeBytes: 2_000, groupKeys: [WORKSPACE_1] },
        { jobId: 'job-2', sizeBytes: 100, groupKeys: [WORKSPACE_2] },
        { jobId: 'job-3', sizeBytes: 2_000, groupKeys: [WORKSPACE_3] },
      ],
    });

    await expect(refusal).rejects.toMatchObject({
      code: MessageQueueExceptionCode.JOB_QUEUE_MEMORY_LIMIT_REACHED,
      details: { refusedGroupKeys: [WORKSPACE_1, WORKSPACE_3] },
    });
    await expect(refusal).rejects.toThrow(
      `for ${WORKSPACE_1}, ${WORKSPACE_3}:`,
    );
    expect(await readUsedBytes({ redis, groupKey: WORKSPACE_2 })).toBe(0);
  });

  it('admits a batch within the limit', async () => {
    const { limiter } = await createLimiter();

    const admission = await limiter.admit({
      queueName: QUEUE,
      jobName: 'job',
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
      getJobKey: ({ queueName, jobId }) =>
        `${KEY_PREFIX}:${queueName}:${jobId}`,
      keyPrefix: KEY_PREFIX,
      metricsService: { incrementCounterForEvent: jest.fn() } as never,
      twentyConfigService: buildConfig({
        isEnabled: true,
        workspaceShare: 0.1,
        applicationShare: 0.4,
        reserve: 0,
      }),
    });

    await expect(
      brokenLimiter.admit({
        queueName: QUEUE,
        jobName: 'job',
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
      jobName: 'job',
      jobs: [{ jobId: 'job-1', sizeBytes: 900, groupKeys: [WORKSPACE_1] }],
    });
    metricsService.incrementCounterForEvent.mockClear();

    const admission = await limiter.admit({
      queueName: QUEUE,
      jobName: 'job',
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
      jobName: 'job',
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

  it('keeps charges without expiry, so a long-delayed job stays charged', async () => {
    const { redis, limiter } = await createLimiter();

    await limiter.admit({
      queueName: QUEUE,
      jobName: 'job',
      jobs: [{ jobId: 'job-1', sizeBytes: 300, groupKeys: [WORKSPACE_1] }],
    });

    expect(await redis.ttl(usedKeyOf(WORKSPACE_1))).toBe(-1);
    expect(await redis.ttl(jobsKeyOf(WORKSPACE_1))).toBe(-1);
  });

  it.each<{ name: string; options: Parameters<typeof createLimiter>[0] }>([
    { name: 'disabled', options: { isEnabled: false } },
    { name: 'maxmemory is unset', options: { maxMemoryBytes: 0 } },
  ])('does not charge when $name', async ({ options }) => {
    const { redis, limiter } = await createLimiter(options);

    const admission = await limiter.admit({
      queueName: QUEUE,
      jobName: 'job',
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

  describe('getTopGroupKeyMemoryUsages', () => {
    it('lists charged group keys by used bytes, largest first', async () => {
      const { redis, limiter } = await createLimiter();

      await redis.set(usedKeyOf(WORKSPACE_1), 300);
      await redis.set(usedKeyOf(WORKSPACE_2), 900);
      await redis.set(usedKeyOf(APPLICATION), 500);

      expect(await limiter.getTopGroupKeyMemoryUsages(QUEUE)).toEqual([
        { groupKey: WORKSPACE_2, usedBytes: 900 },
        { groupKey: APPLICATION, usedBytes: 500 },
        { groupKey: WORKSPACE_1, usedBytes: 300 },
      ]);
    });

    it('keeps only the 20 largest group keys', async () => {
      const { redis, limiter } = await createLimiter();

      for (let index = 1; index <= 25; index++) {
        await redis.set(usedKeyOf(`workspace:ws-${index}`), index);
      }

      const usages = await limiter.getTopGroupKeyMemoryUsages(QUEUE);

      expect(usages).toHaveLength(20);
      expect(usages[0]).toEqual({ groupKey: 'workspace:ws-25', usedBytes: 25 });
      expect(usages[19]).toEqual({ groupKey: 'workspace:ws-6', usedBytes: 6 });
    });

    it('serves the cached top group keys until the cache expires', async () => {
      const { redis, limiter } = await createLimiter();

      await redis.set(usedKeyOf(WORKSPACE_1), 300);
      await limiter.getTopGroupKeyMemoryUsages(QUEUE);
      await redis.set(usedKeyOf(WORKSPACE_2), 900);

      expect(await limiter.getTopGroupKeyMemoryUsages(QUEUE)).toEqual([
        { groupKey: WORKSPACE_1, usedBytes: 300 },
      ]);

      await redis.del(`${KEY_PREFIX}:jobmem:top`);

      expect(await limiter.getTopGroupKeyMemoryUsages(QUEUE)).toEqual([
        { groupKey: WORKSPACE_2, usedBytes: 900 },
        { groupKey: WORKSPACE_1, usedBytes: 300 },
      ]);
    });

    it('reports nothing when memory fairness is disabled', async () => {
      const { redis, limiter } = await createLimiter({ isEnabled: false });

      await redis.set(usedKeyOf(WORKSPACE_1), 300);

      expect(await limiter.getTopGroupKeyMemoryUsages(QUEUE)).toEqual([]);
    });
  });

  describe('reconcile', () => {
    const jobKeyOf = (jobId: string) => `${KEY_PREFIX}:${QUEUE}:${jobId}`;

    const chargeJob = async ({
      limiter,
      jobId,
      sizeBytes = 300,
    }: {
      limiter: JobMemoryLimiter;
      jobId: string;
      sizeBytes?: number;
    }) =>
      limiter.admit({
        queueName: QUEUE,
        jobName: 'job',
        jobs: [{ jobId, sizeBytes, groupKeys: [WORKSPACE_1, APPLICATION] }],
      });

    it('releases a charge only when two passes in a row find no job for it', async () => {
      const { redis, limiter } = await createLimiter();

      await chargeJob({ limiter, jobId: 'deleted-job' });

      expect(await limiter.reconcile(QUEUE)).toEqual({
        releasedCount: 0,
        releasedBytes: 0,
      });
      expect(await readUsedBytes({ redis, groupKey: WORKSPACE_1 })).toBe(300);

      expect(await limiter.reconcile(QUEUE)).toEqual({
        releasedCount: 2,
        releasedBytes: 600,
      });
      expect(await readUsedBytes({ redis, groupKey: WORKSPACE_1 })).toBe(0);
      expect(await readUsedBytes({ redis, groupKey: APPLICATION })).toBe(0);
    });

    it('reconciles a group key once per run even when SCAN returns it twice', async () => {
      const { redis, limiter } = await createLimiter();

      await limiter.admit({
        queueName: QUEUE,
        jobName: 'job',
        jobs: [
          { jobId: 'deleted-job', sizeBytes: 300, groupKeys: [WORKSPACE_1] },
        ],
      });
      jest
        .spyOn(redis, 'scan')
        .mockResolvedValue([
          '0',
          [jobsKeyOf(WORKSPACE_1), jobsKeyOf(WORKSPACE_1)],
        ] as never);

      expect(await limiter.reconcile(QUEUE)).toEqual({
        releasedCount: 0,
        releasedBytes: 0,
      });
      expect(await readUsedBytes({ redis, groupKey: WORKSPACE_1 })).toBe(300);
    });

    it('keeps the charge of a job that BullMQ still holds unfinished', async () => {
      const { redis, limiter } = await createLimiter();

      await chargeJob({ limiter, jobId: 'waiting-job' });
      await redis.hset(jobKeyOf('waiting-job'), 'name', 'job');

      await limiter.reconcile(QUEUE);
      await limiter.reconcile(QUEUE);

      expect(await readUsedBytes({ redis, groupKey: WORKSPACE_1 })).toBe(300);
    });

    it('releases a job that BullMQ finished but kept, since its release was lost', async () => {
      const { redis, limiter } = await createLimiter();

      await chargeJob({ limiter, jobId: 'finished-job' });
      await redis.hset(jobKeyOf('finished-job'), 'finishedOn', Date.now());

      await limiter.reconcile(QUEUE);
      await limiter.reconcile(QUEUE);

      expect(await readUsedBytes({ redis, groupKey: WORKSPACE_1 })).toBe(0);
    });

    it('forgets a suspect once BullMQ adds its job, so a late add is never released', async () => {
      const { redis, limiter } = await createLimiter();

      await chargeJob({ limiter, jobId: 'late-job' });
      await limiter.reconcile(QUEUE);
      await redis.hset(jobKeyOf('late-job'), 'name', 'job');
      await limiter.reconcile(QUEUE);
      await redis.del(jobKeyOf('late-job'));
      await limiter.reconcile(QUEUE);

      expect(await readUsedBytes({ redis, groupKey: WORKSPACE_1 })).toBe(300);
    });

    it('leaves other charges of the key untouched', async () => {
      const { redis, limiter } = await createLimiter();

      await chargeJob({ limiter, jobId: 'deleted-job', sizeBytes: 300 });
      await chargeJob({ limiter, jobId: 'live-job', sizeBytes: 200 });
      await redis.hset(jobKeyOf('live-job'), 'name', 'job');

      await limiter.reconcile(QUEUE);
      await limiter.reconcile(QUEUE);

      expect(await readUsedBytes({ redis, groupKey: WORKSPACE_1 })).toBe(200);
      expect(Object.keys(await redis.hgetall(jobsKeyOf(WORKSPACE_1)))).toEqual([
        `${QUEUE}:live-job`,
      ]);
    });
  });
});

describe('critical maintenance queues', () => {
  it.each(NOT_CHARGED_QUEUES)(
    'admits %s when the workspace has no memory available',
    async (queueName) => {
      const { limiter, redis } = await createLimiter({
        usedMemoryBytes: 10_000,
      });

      await expect(
        limiter.admit({
          queueName,
          jobName: 'maintenance',
          jobs: [
            { jobId: 'maintenance', sizeBytes: 500, groupKeys: [WORKSPACE_1] },
          ],
        }),
      ).resolves.toEqual({ isCharged: false, availableBytes: null });
      expect(await redis.get(usedKeyOf(WORKSPACE_1))).toBeNull();

      await expect(
        limiter.admit({
          queueName: QUEUE,
          jobName: 'application-job',
          jobs: [
            {
              jobId: 'application-job',
              sizeBytes: 500,
              groupKeys: [WORKSPACE_1],
            },
          ],
        }),
      ).rejects.toMatchObject({
        code: MessageQueueExceptionCode.JOB_QUEUE_MEMORY_LIMIT_REACHED,
      });
    },
  );
});
