import { Logger } from '@nestjs/common';

import { type Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';

import { GroupRatePacer } from 'src/engine/core-modules/message-queue/drivers/fairness/group-rate-pacer';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

const QUEUE = MessageQueue.logicFunctionQueue;
const KEY_PREFIX = 'bull';
const NOW_MS = 1_800_000_000_000;
const APPLICATION_LIMITS = {
  application: { max: 3, durationMs: 3_000 },
};

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
      requests: [{ groupKeys: ['workspace:A'], jobCount: 2 }],
      groupRateLimits: APPLICATION_LIMITS,
    });

    expect(delays).toBeUndefined();
    expect(runCommand).not.toHaveBeenCalled();
  });

  it('lets a burst through then spaces the next jobs by the interval', async () => {
    const { pacer } = await createPacer();

    const delays = await pacer.computeDelays({
      queueName: QUEUE,
      requests: [{ groupKeys: ['application:H'], jobCount: 5 }],
      groupRateLimits: APPLICATION_LIMITS,
    });

    expect(delays).toEqual([[0, 0, 0, 1_000, 2_000]]);
  });

  it('continues from the slot left by the previous enqueue of the same key', async () => {
    const { pacer } = await createPacer();
    const request = {
      queueName: QUEUE,
      requests: [{ groupKeys: ['application:H'], jobCount: 3 }],
      groupRateLimits: APPLICATION_LIMITS,
    };

    await pacer.computeDelays(request);

    expect(await pacer.computeDelays(request)).toEqual([[1_000, 2_000, 3_000]]);
  });

  it('refills the burst as time passes', async () => {
    const { pacer } = await createPacer();
    const request = {
      queueName: QUEUE,
      requests: [{ groupKeys: ['application:H'], jobCount: 3 }],
      groupRateLimits: APPLICATION_LIMITS,
    };

    await pacer.computeDelays(request);
    jest.setSystemTime(NOW_MS + 2_000);

    expect(await pacer.computeDelays(request)).toEqual([[0, 0, 1_000]]);
  });

  it('spaces every job by the interval with a burst of 1', async () => {
    const { pacer } = await createPacer();

    const delays = await pacer.computeDelays({
      queueName: QUEUE,
      requests: [{ groupKeys: ['application:H'], jobCount: 3 }],
      groupRateLimits: {
        application: { max: 3, durationMs: 3_000, burst: 1 },
      },
    });

    expect(delays).toEqual([[0, 1_000, 2_000]]);
  });

  it('delays a job to its slowest key while each key only pays for its own jobs', async () => {
    const { pacer } = await createPacer();
    const groupRateLimits = {
      application: { max: 1, durationMs: 10_000 },
      workspace: { max: 1, durationMs: 1_000 },
    };

    await pacer.computeDelays({
      queueName: QUEUE,
      requests: [{ groupKeys: ['application:H'], jobCount: 1 }],
      groupRateLimits,
    });

    const delays = await pacer.computeDelays({
      queueName: QUEUE,
      requests: [
        { groupKeys: ['workspace:A', 'application:H'], jobCount: 1 },
        { groupKeys: ['workspace:A', 'application:Q'], jobCount: 1 },
      ],
      groupRateLimits,
    });

    expect(delays).toEqual([[10_000], [1_000]]);
  });

  it('keeps the slot of a key no longer than until it is in the past', async () => {
    const { pacer, redis } = await createPacer();

    await pacer.computeDelays({
      queueName: QUEUE,
      requests: [{ groupKeys: ['application:H'], jobCount: 5 }],
      groupRateLimits: APPLICATION_LIMITS,
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
      requests: [{ groupKeys: ['application:H'], jobCount: 1 }],
      groupRateLimits: APPLICATION_LIMITS,
    });

    expect(delays).toBeUndefined();
    expect(metricsService.incrementCounterForEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        key: MetricsKeys.JobGroupRateLimitFallback,
      }),
    );
  });
});
