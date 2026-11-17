import { Logger } from '@nestjs/common';

import { type Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';
import { isDefined } from 'twenty-shared/utils';

import { GroupRatePacer } from 'src/engine/core-modules/message-queue/drivers/fairness/group-rate-pacer';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueLimiter } from 'src/engine/core-modules/message-queue/types/message-queue-limiter.type';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

const QUEUE = MessageQueue.logicFunctionQueue;
const KEY_PREFIX = 'bull';
const NOW_MS = 1_800_000_000_000;
const APPLICATION_LIMITS = {
  application: { max: 3, durationMs: 3_000 },
};

const withLimiters = (
  limits: Record<string, MessageQueueLimiter>,
  requests: { groupKeys: string[]; jobCount: number }[],
) =>
  requests.map(({ groupKeys, jobCount }) => ({
    jobCount,
    limiters: groupKeys.flatMap((groupKey) => {
      const limiter = limits[groupKey.split(':')[0]];

      return isDefined(limiter) ? [{ groupKey, limiter }] : [];
    }),
  }));

const createPacer = async () => {
  const redis: Redis = new RedisMock();

  await redis.flushall();

  const runCommand = jest.fn(
    async (name: string, args: (string | number)[]) => {
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
  );
  const metricsService = {
    incrementCounterForEvent: jest.fn().mockResolvedValue(undefined),
  };
  const pacer = new GroupRatePacer({
    getClient: async () => ({ runCommand }) as never,
    keyPrefix: KEY_PREFIX,
    metricsService: metricsService as never,
  });

  return { redis, runCommand, metricsService, pacer };
};

describe('GroupRatePacer', () => {
  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  beforeEach(() => {
    jest.useFakeTimers({ now: NOW_MS });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not call Redis when no group key of the jobs is limited', async () => {
    const { pacer, runCommand } = await createPacer();

    const delays = await pacer.computeDelays({
      queueName: QUEUE,
      requests: withLimiters(APPLICATION_LIMITS, [
        { groupKeys: ['workspace:A'], jobCount: 2 },
      ]),
    });

    expect(delays).toBeUndefined();
    expect(runCommand).not.toHaveBeenCalled();
  });

  it('makes a single job due immediately when no slot is reserved', async () => {
    const { pacer } = await createPacer();

    const delays = await pacer.computeDelays({
      queueName: QUEUE,
      requests: withLimiters(APPLICATION_LIMITS, [
        { groupKeys: ['application:H'], jobCount: 1 },
      ]),
    });

    expect(delays).toEqual([[0]]);
  });

  it('spaces a batch by the interval from its first job, without a burst', async () => {
    const { pacer } = await createPacer();

    const delays = await pacer.computeDelays({
      queueName: QUEUE,
      requests: withLimiters(APPLICATION_LIMITS, [
        { groupKeys: ['application:H'], jobCount: 5 },
      ]),
    });

    expect(delays).toEqual([[0, 1_000, 2_000, 3_000, 4_000]]);
  });

  it.each([
    { limiter: { max: 1, durationMs: 1_000 }, expected: [0, 1_000, 2_000] },
    { limiter: { max: 1, durationMs: 60_000 }, expected: [0, 60_000, 120_000] },
    { limiter: { max: 100, durationMs: 60_000 }, expected: [0, 600, 1_200] },
  ])(
    'paces $limiter.max per $limiter.durationMs ms at one job every durationMs / max',
    async ({ limiter, expected }) => {
      const { pacer } = await createPacer();

      const delays = await pacer.computeDelays({
        queueName: QUEUE,
        requests: withLimiters({ application: limiter }, [
          { groupKeys: ['application:H'], jobCount: 3 },
        ]),
      });

      expect(delays).toEqual([expected]);
    },
  );

  it('spreads 200 jobs submitted together at 100 per minute over 119.4 seconds', async () => {
    const { pacer } = await createPacer();

    const delays = await pacer.computeDelays({
      queueName: QUEUE,
      requests: withLimiters(
        { application: { max: 100, durationMs: 60_000 } },
        [{ groupKeys: ['application:H'], jobCount: 200 }],
      ),
    });

    expect(delays?.[0]).toEqual(
      Array.from({ length: 200 }, (_, jobIndex) => jobIndex * 600),
    );
    expect(delays?.[0][199]).toBe(119_400);
  });

  it('continues from the slot left by the previous enqueue of the same key', async () => {
    const { pacer } = await createPacer();
    const request = {
      queueName: QUEUE,
      requests: withLimiters(APPLICATION_LIMITS, [
        { groupKeys: ['application:H'], jobCount: 1 },
      ]),
    };

    expect(await pacer.computeDelays(request)).toEqual([[0]]);
    expect(await pacer.computeDelays(request)).toEqual([[1_000]]);
    expect(await pacer.computeDelays(request)).toEqual([[2_000]]);
  });

  it('gives concurrent enqueues of the same key distinct slots', async () => {
    const { pacer } = await createPacer();
    const request = {
      queueName: QUEUE,
      requests: withLimiters(APPLICATION_LIMITS, [
        { groupKeys: ['application:H'], jobCount: 2 },
      ]),
    };

    const delays = await Promise.all(
      Array.from({ length: 4 }, () => pacer.computeDelays(request)),
    );

    expect(
      delays.flatMap((delay) => delay?.[0] ?? []).sort((a, b) => a - b),
    ).toEqual([0, 1_000, 2_000, 3_000, 4_000, 5_000, 6_000, 7_000]);
  });

  it('paces each key on its own', async () => {
    const { pacer } = await createPacer();

    await pacer.computeDelays({
      queueName: QUEUE,
      requests: withLimiters(APPLICATION_LIMITS, [
        { groupKeys: ['application:H'], jobCount: 5 },
      ]),
    });

    const delays = await pacer.computeDelays({
      queueName: QUEUE,
      requests: withLimiters(APPLICATION_LIMITS, [
        { groupKeys: ['application:Q'], jobCount: 2 },
        { groupKeys: ['application:H'], jobCount: 1 },
      ]),
    });

    expect(delays).toEqual([[0, 1_000], [5_000]]);
  });

  it('keeps the reserved slots while they are still ahead', async () => {
    const { pacer } = await createPacer();
    const request = {
      queueName: QUEUE,
      requests: withLimiters(APPLICATION_LIMITS, [
        { groupKeys: ['application:H'], jobCount: 3 },
      ]),
    };

    await pacer.computeDelays(request);
    jest.setSystemTime(NOW_MS + 2_000);

    expect(await pacer.computeDelays(request)).toEqual([[1_000, 2_000, 3_000]]);
  });

  it('does not let an idle period build up a burst', async () => {
    const { pacer } = await createPacer();
    const request = {
      queueName: QUEUE,
      requests: withLimiters(APPLICATION_LIMITS, [
        { groupKeys: ['application:H'], jobCount: 3 },
      ]),
    };

    await pacer.computeDelays(request);
    jest.setSystemTime(NOW_MS + 60_000);

    expect(await pacer.computeDelays(request)).toEqual([[0, 1_000, 2_000]]);
  });

  it('starts pacing at the caller delay', async () => {
    const { pacer } = await createPacer();

    const delays = await pacer.computeDelays({
      queueName: QUEUE,
      notBeforeDelayMs: 700,
      requests: withLimiters(APPLICATION_LIMITS, [
        { groupKeys: ['application:H'], jobCount: 3 },
      ]),
    });

    expect(delays).toEqual([[700, 1_700, 2_700]]);
  });

  it('does not hold the next jobs behind a delayed one', async () => {
    const { pacer, redis } = await createPacer();
    const requests = withLimiters(APPLICATION_LIMITS, [
      { groupKeys: ['application:H'], jobCount: 1 },
    ]);

    expect(
      await pacer.computeDelays({
        queueName: QUEUE,
        notBeforeDelayMs: 15_000,
        requests,
      }),
    ).toEqual([[15_000]]);
    expect(await pacer.computeDelays({ queueName: QUEUE, requests })).toEqual([
      [1_000],
    ]);
    expect(
      Number(await redis.get(`${KEY_PREFIX}:${QUEUE}:fair:slot:application:H`)),
    ).toBe(NOW_MS + 2_000);
  });

  it('keeps a delayed job behind the slots already reserved past its delay', async () => {
    const { pacer } = await createPacer();
    const requests = withLimiters(APPLICATION_LIMITS, [
      { groupKeys: ['application:H'], jobCount: 3 },
    ]);

    await pacer.computeDelays({ queueName: QUEUE, requests });

    expect(
      await pacer.computeDelays({
        queueName: QUEUE,
        notBeforeDelayMs: 700,
        requests,
      }),
    ).toEqual([[3_000, 4_000, 5_000]]);
  });

  it.each([
    { max: 0, durationMs: 1_000 },
    { max: 1.5, durationMs: 1_000 },
    { max: Number.NaN, durationMs: 1_000 },
    { max: 1, durationMs: 0 },
    { max: 1, durationMs: Number.POSITIVE_INFINITY },
  ])('ignores the invalid limiter $max per $durationMs ms', async (limiter) => {
    const { pacer, runCommand } = await createPacer();

    const delays = await pacer.computeDelays({
      queueName: QUEUE,
      requests: withLimiters({ application: limiter }, [
        { groupKeys: ['application:H'], jobCount: 2 },
      ]),
    });

    expect(delays).toBeUndefined();
    expect(runCommand).not.toHaveBeenCalled();
  });

  it('delays a job to its slowest key while each key only pays for its own jobs', async () => {
    const { pacer } = await createPacer();
    const groupRateLimits = {
      application: { max: 1, durationMs: 10_000 },
      workspace: { max: 1, durationMs: 1_000 },
    };

    await pacer.computeDelays({
      queueName: QUEUE,
      requests: withLimiters(groupRateLimits, [
        { groupKeys: ['application:H'], jobCount: 1 },
      ]),
    });

    const delays = await pacer.computeDelays({
      queueName: QUEUE,
      requests: withLimiters(groupRateLimits, [
        { groupKeys: ['workspace:A', 'application:H'], jobCount: 1 },
        { groupKeys: ['workspace:A', 'application:Q'], jobCount: 1 },
      ]),
    });

    expect(delays).toEqual([[10_000], [1_000]]);
  });

  it('keeps the slot of a key no longer than until it is in the past', async () => {
    const { pacer, redis } = await createPacer();

    await pacer.computeDelays({
      queueName: QUEUE,
      requests: withLimiters(APPLICATION_LIMITS, [
        { groupKeys: ['application:H'], jobCount: 5 },
      ]),
    });

    const slotKey = `${KEY_PREFIX}:${QUEUE}:fair:slot:application:H`;

    expect(Number(await redis.get(slotKey))).toBe(NOW_MS + 5_000);
    expect(await redis.pttl(slotKey)).toBeLessThanOrEqual(5_000);
  });

  it('returns undefined and counts a fallback when Redis fails', async () => {
    const { pacer, runCommand, metricsService } = await createPacer();

    runCommand.mockRejectedValue(new Error('Redis connection lost'));

    const delays = await pacer.computeDelays({
      queueName: QUEUE,
      requests: withLimiters(APPLICATION_LIMITS, [
        { groupKeys: ['application:H'], jobCount: 1 },
      ]),
    });

    expect(delays).toBeUndefined();
    expect(metricsService.incrementCounterForEvent).toHaveBeenCalledTimes(1);
    expect(metricsService.incrementCounterForEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        key: MetricsKeys.JobGroupRateLimitFallback,
      }),
    );
  });
});
