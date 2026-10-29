import { readFileSync } from 'node:fs';

import { Logger } from '@nestjs/common';

import { type Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';
import { isDefined } from 'twenty-shared/utils';

import {
  PRIORITY_SCORE_BASE,
  ticketOf,
} from 'src/engine/core-modules/message-queue/drivers/__tests__/fairness-harness.test-util';
import { FairTicketAllocator } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-ticket-allocator';
import {
  FAIR_REBASE_STEP,
  FAIR_REBASE_THRESHOLD,
  URGENT_FAIR_PRIORITY,
} from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

const QUEUE = MessageQueue.logicFunctionQueue;
const KEY_PREFIX = 'bull';
const QUEUE_KEY_PREFIX = `${KEY_PREFIX}:${QUEUE}:`;
const VIRTUAL_TIME_KEY = `${QUEUE_KEY_PREFIX}fair:vtime`;
const BASE_KEY = `${QUEUE_KEY_PREFIX}fair:base`;
const REBASE_KEY = `${QUEUE_KEY_PREFIX}fair:rebase`;
const WEIGHTS_KEY = `${QUEUE_KEY_PREFIX}fair:weights`;
const PRIORITIZED_KEY = `${QUEUE_KEY_PREFIX}prioritized`;
const DELAYED_KEY = `${QUEUE_KEY_PREFIX}delayed`;
const ACTIVE_KEY = `${QUEUE_KEY_PREFIX}active`;
const BULLMQ_PRIORITY_SCORE_LUA =
  require.resolve('bullmq/dist/cjs/commands/includes/getPriorityScore.lua');

const jobKeyOf = (jobId: string) => `${QUEUE_KEY_PREFIX}${jobId}`;

const createAllocator = async ({
  rebaseGraceMs = 0,
}: { rebaseGraceMs?: number } = {}) => {
  const redis: Redis = new RedisMock();

  await redis.flushall();

  const client = {
    runCommand: async (name: string, args: (string | number)[]) => {
      const [script, numberOfKeys, ...scriptArguments] = args;

      if (name === 'evalsha') {
        return redis.evalsha(
          String(script),
          Number(numberOfKeys),
          ...scriptArguments,
        );
      }

      if (name !== 'eval') {
        throw new Error(`Unexpected Redis command ${name}`);
      }

      return redis.eval(
        String(script),
        Number(numberOfKeys),
        ...scriptArguments,
      );
    },
  };
  const seedJob = async ({
    jobId,
    priority,
    counter,
    state,
    base = 0,
    stampedBase,
  }: {
    jobId: string;
    priority: number;
    counter: number;
    state: 'prioritized' | 'delayed' | 'active';
    base?: number | 'none';
    stampedBase?: number;
  }) => {
    const jobKey = jobKeyOf(jobId);

    await redis.hset(jobKey, 'priority', priority);

    if (base !== 'none') {
      await redis.hset(
        jobKey,
        'opts',
        JSON.stringify({ priority, fairBase: base }),
      );
    }

    if (isDefined(stampedBase)) {
      await redis.hset(jobKey, 'fairBase', stampedBase);
    }

    if (state === 'prioritized') {
      await redis.zadd(
        PRIORITIZED_KEY,
        priority * PRIORITY_SCORE_BASE + counter,
        jobId,
      );
    } else if (state === 'delayed') {
      await redis.zadd(DELAYED_KEY, counter, jobId);
    } else {
      await redis.rpush(ACTIVE_KEY, jobId);
    }
  };

  return {
    redis,
    allocator: new FairTicketAllocator({
      getClient: async () => client as never,
      getJobKey: ({ jobId }) => jobKeyOf(jobId),
      keyPrefix: KEY_PREFIX,
      rebaseGraceMs,
    }),
    seedJob,
    readClock: async (groupKey: string) => {
      const raw = await redis.get(`${QUEUE_KEY_PREFIX}fair:clock:${groupKey}`);

      return raw?.split(':').map(Number);
    },
    readPriority: async (jobId: string) =>
      Number(await redis.hget(jobKeyOf(jobId), 'priority')),
    readStampedBase: async (jobId: string) => {
      const raw = await redis.hget(jobKeyOf(jobId), 'fairBase');

      return isDefined(raw) ? Number(raw) : undefined;
    },
    readVirtualTime: async () => Number(await redis.get(VIRTUAL_TIME_KEY)),
    readBase: async () => Number((await redis.get(BASE_KEY)) ?? 0),
    isRebasing: async () => (await redis.exists(REBASE_KEY)) === 1,
    readPrioritizedWithScores: async () =>
      (await redis.zrange(PRIORITIZED_KEY, 0, -1, 'WITHSCORES')).map(
        (value, index) => (index % 2 === 1 ? Number(value) : value),
      ),
  };
};

const createBrokenAllocator = () =>
  new FairTicketAllocator({
    getClient: async () => {
      throw new Error('Redis connection lost');
    },
    getJobKey: ({ jobId }) => jobKeyOf(jobId),
    keyPrefix: KEY_PREFIX,
  });

describe('FairTicketAllocator', () => {
  beforeAll(() => {
    jest.useRealTimers();
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  describe('allocateTickets', () => {
    it('tags a request at its latest clock and charges each key for its own batch only', async () => {
      const { allocator, readClock } = await createAllocator();

      expect(
        await allocator.allocateTickets({
          queueName: QUEUE,
          requests: [
            { groupKeys: ['workspace:X', 'application:H'], jobCount: 100 },
            { groupKeys: ['workspace:W', 'application:H'], jobCount: 1 },
            { groupKeys: ['workspace:W', 'application:Q'], jobCount: 1 },
          ],
        }),
      ).toEqual({
        base: 0,
        tickets: [
          { tag: 0, weight: 1 },
          { tag: 100, weight: 1 },
          { tag: 1, weight: 1 },
        ],
      });
      expect(await readClock('application:H')).toEqual([0, 101]);
      expect(await readClock('workspace:W')).toEqual([0, 2]);
    });

    it('tags a request at the virtual time when it is ahead of its clocks', async () => {
      const { redis, allocator, readClock } = await createAllocator();

      await redis.set(VIRTUAL_TIME_KEY, 5);

      expect(
        await allocator.allocateTickets({
          queueName: QUEUE,
          requests: [{ groupKeys: ['workspace:B'], jobCount: 2 }],
        }),
      ).toEqual({ base: 0, tickets: [{ tag: 5, weight: 1 }] });
      expect(await readClock('workspace:B')).toEqual([0, 7]);
    });

    it('returns the base it allocated on and reads a clock stamped with an older base one step down', async () => {
      const { redis, allocator, readClock } = await createAllocator();

      await redis.set(VIRTUAL_TIME_KEY, 3);
      await redis.set(BASE_KEY, FAIR_REBASE_STEP);
      await redis.set(
        `${QUEUE_KEY_PREFIX}fair:clock:workspace:S`,
        `0:${FAIR_REBASE_STEP + 8}`,
      );

      expect(
        await allocator.allocateTickets({
          queueName: QUEUE,
          requests: [{ groupKeys: ['workspace:S'], jobCount: 1 }],
        }),
      ).toEqual({ base: FAIR_REBASE_STEP, tickets: [{ tag: 8, weight: 1 }] });
      expect(await readClock('workspace:S')).toEqual([FAIR_REBASE_STEP, 9]);
    });

    it('reads a clock written before the base existed on the current base', async () => {
      const { redis, allocator, readClock } = await createAllocator();

      await redis.set(`${QUEUE_KEY_PREFIX}fair:clock:workspace:L`, 7);

      expect(
        await allocator.allocateTickets({
          queueName: QUEUE,
          requests: [{ groupKeys: ['workspace:L'], jobCount: 1 }],
        }),
      ).toEqual({ base: 0, tickets: [{ tag: 7, weight: 1 }] });
      expect(await readClock('workspace:L')).toEqual([0, 8]);
    });

    it('weighs a request by the product of its key weights and ignores a malformed weight', async () => {
      const { redis, allocator } = await createAllocator();

      await redis.hset(WEIGHTS_KEY, 'application:P', '2');
      await redis.hset(WEIGHTS_KEY, 'workspace:W', 'not-a-number');
      await redis.hset(WEIGHTS_KEY, 'application:N', '-1');

      expect(
        await allocator.allocateTickets({
          queueName: QUEUE,
          requests: [
            { groupKeys: ['workspace:W', 'application:P'], jobCount: 2 },
            { groupKeys: ['workspace:W', 'application:N'], jobCount: 1 },
          ],
        }),
      ).toEqual({
        base: 0,
        tickets: [
          { tag: 0, weight: 2 },
          { tag: 1, weight: 1 },
        ],
      });
    });

    it('returns nothing when Redis is unavailable', async () => {
      expect(
        await createBrokenAllocator().allocateTickets({
          queueName: QUEUE,
          requests: [{ groupKeys: ['workspace:A'], jobCount: 1 }],
        }),
      ).toBeUndefined();
    });

    it('retries with EVAL only when Redis does not know the script', async () => {
      const runCommand = jest
        .fn()
        .mockRejectedValue(new Error('READONLY replica is read only'));
      const allocator = new FairTicketAllocator({
        getClient: async () => ({ runCommand }) as never,
        getJobKey: ({ jobId }) => jobKeyOf(jobId),
        keyPrefix: KEY_PREFIX,
      });

      expect(
        await allocator.allocateTickets({
          queueName: QUEUE,
          requests: [{ groupKeys: ['workspace:A'], jobCount: 1 }],
        }),
      ).toBeUndefined();
      expect(runCommand).toHaveBeenCalledTimes(1);
      expect(runCommand).toHaveBeenCalledWith('evalsha', expect.any(Array));
    });
  });

  describe('recordDispatch', () => {
    it('relies on the priority score layout of the installed BullMQ', () => {
      expect(readFileSync(BULLMQ_PRIORITY_SCORE_LUA, 'utf8')).toContain(
        'priority * 0x100000000 + prioCounter % 0x100000000',
      );
    });

    it('advances the virtual time from the dispatched job hash and leaves urgent and missing jobs alone', async () => {
      const { allocator, seedJob, readVirtualTime } = await createAllocator();

      await seedJob({
        jobId: 'A1',
        priority: ticketOf(5),
        counter: 1,
        state: 'active',
      });
      await seedJob({
        jobId: 'urgent',
        priority: URGENT_FAIR_PRIORITY,
        counter: 2,
        state: 'active',
      });

      await allocator.recordDispatch({ queueName: QUEUE, jobId: 'A1' });
      await allocator.recordDispatch({ queueName: QUEUE, jobId: 'urgent' });
      await allocator.recordDispatch({ queueName: QUEUE, jobId: 'missing' });

      expect(await readVirtualTime()).toBe(5);
      expect(
        await allocator.allocateTickets({
          queueName: QUEUE,
          requests: [{ groupKeys: ['workspace:B'], jobCount: 1 }],
        }),
      ).toEqual({ base: 0, tickets: [{ tag: 5, weight: 1 }] });
    });

    it('never moves the virtual time back', async () => {
      const { allocator, seedJob, readVirtualTime } = await createAllocator();

      await seedJob({
        jobId: 'late',
        priority: ticketOf(9),
        counter: 1,
        state: 'active',
      });
      await seedJob({
        jobId: 'early',
        priority: ticketOf(3),
        counter: 2,
        state: 'active',
      });

      await allocator.recordDispatch({ queueName: QUEUE, jobId: 'late' });
      await allocator.recordDispatch({ queueName: QUEUE, jobId: 'early' });

      expect(await readVirtualTime()).toBe(9);
    });

    it('rewrites the waiting tickets in chunks once the threshold is passed, keeping the order and leaving urgent and static priorities alone', async () => {
      const {
        redis,
        allocator,
        seedJob,
        readPriority,
        readStampedBase,
        readVirtualTime,
        readBase,
        isRebasing,
        readPrioritizedWithScores,
        readClock,
      } = await createAllocator();
      const fillerCount = 1200;

      await redis.set(VIRTUAL_TIME_KEY, FAIR_REBASE_THRESHOLD - 1);
      await redis.set(
        `${QUEUE_KEY_PREFIX}fair:clock:workspace:A`,
        `0:${FAIR_REBASE_THRESHOLD + 3}`,
      );
      await seedJob({
        jobId: 'urgent',
        priority: URGENT_FAIR_PRIORITY,
        counter: 1,
        state: 'prioritized',
      });
      await seedJob({
        jobId: 'static',
        priority: 4,
        counter: 2,
        state: 'prioritized',
        base: 'none',
      });
      await seedJob({
        jobId: 'A2',
        priority: ticketOf(FAIR_REBASE_THRESHOLD + 1),
        counter: 3,
        state: 'prioritized',
      });
      await seedJob({
        jobId: 'A3',
        priority: ticketOf(FAIR_REBASE_THRESHOLD + 2),
        counter: 4,
        state: 'prioritized',
      });
      for (let index = 0; index < fillerCount; index += 1) {
        await seedJob({
          jobId: `F${index}`,
          priority: ticketOf(FAIR_REBASE_THRESHOLD + 10 + index),
          counter: 100 + index,
          state: 'prioritized',
        });
      }
      await seedJob({
        jobId: 'retrying',
        priority: ticketOf(FAIR_REBASE_THRESHOLD + 5),
        counter: 5,
        state: 'delayed',
      });
      await seedJob({
        jobId: 'running',
        priority: ticketOf(FAIR_REBASE_THRESHOLD),
        counter: 6,
        state: 'active',
      });

      await allocator.recordDispatch({ queueName: QUEUE, jobId: 'running' });
      await allocator.rebase(QUEUE);

      expect(await readVirtualTime()).toBe(
        FAIR_REBASE_THRESHOLD - FAIR_REBASE_STEP,
      );
      expect(await readBase()).toBe(FAIR_REBASE_STEP);
      expect(await isRebasing()).toBe(false);
      expect((await readPrioritizedWithScores()).slice(0, 8)).toEqual([
        'urgent',
        URGENT_FAIR_PRIORITY * PRIORITY_SCORE_BASE + 1,
        'static',
        4 * PRIORITY_SCORE_BASE + 2,
        'A2',
        ticketOf(FAIR_REBASE_THRESHOLD + 1 - FAIR_REBASE_STEP) *
          PRIORITY_SCORE_BASE +
          3,
        'A3',
        ticketOf(FAIR_REBASE_THRESHOLD + 2 - FAIR_REBASE_STEP) *
          PRIORITY_SCORE_BASE +
          4,
      ]);
      expect(await redis.zcard(PRIORITIZED_KEY)).toBe(fillerCount + 4);
      expect(await readPriority(`F${fillerCount - 1}`)).toBe(
        ticketOf(
          FAIR_REBASE_THRESHOLD + 10 + fillerCount - 1 - FAIR_REBASE_STEP,
        ),
      );
      expect(await readStampedBase('A2')).toBe(FAIR_REBASE_STEP);
      expect(await readPriority('static')).toBe(4);
      expect(await readStampedBase('static')).toBeUndefined();
      expect(await readPriority('retrying')).toBe(
        ticketOf(FAIR_REBASE_THRESHOLD + 5 - FAIR_REBASE_STEP),
      );
      expect(await readPriority('running')).toBe(
        ticketOf(FAIR_REBASE_THRESHOLD - FAIR_REBASE_STEP),
      );
      expect(
        await allocator.allocateTickets({
          queueName: QUEUE,
          requests: [{ groupKeys: ['workspace:A'], jobCount: 1 }],
        }),
      ).toEqual({
        base: FAIR_REBASE_STEP,
        tickets: [
          { tag: FAIR_REBASE_THRESHOLD + 3 - FAIR_REBASE_STEP, weight: 1 },
        ],
      });
      expect(await readClock('workspace:A')).toEqual([
        FAIR_REBASE_STEP,
        FAIR_REBASE_THRESHOLD + 4 - FAIR_REBASE_STEP,
      ]);
    });

    it('shifts every ticket of a backlog deeper than a step exactly once', async () => {
      const { redis, allocator, seedJob, readPrioritizedWithScores } =
        await createAllocator();

      await redis.set(VIRTUAL_TIME_KEY, FAIR_REBASE_THRESHOLD - 1);
      for (const depth of [1, 2, 3]) {
        await seedJob({
          jobId: `deep${depth}`,
          priority: ticketOf(FAIR_REBASE_THRESHOLD + FAIR_REBASE_STEP + depth),
          counter: depth,
          state: 'prioritized',
        });
      }
      await seedJob({
        jobId: 'running',
        priority: ticketOf(FAIR_REBASE_THRESHOLD),
        counter: 9,
        state: 'active',
      });

      await allocator.recordDispatch({ queueName: QUEUE, jobId: 'running' });
      await allocator.rebase(QUEUE);

      expect(await readPrioritizedWithScores()).toEqual([
        'deep1',
        ticketOf(FAIR_REBASE_THRESHOLD + 1) * PRIORITY_SCORE_BASE + 1,
        'deep2',
        ticketOf(FAIR_REBASE_THRESHOLD + 2) * PRIORITY_SCORE_BASE + 2,
        'deep3',
        ticketOf(FAIR_REBASE_THRESHOLD + 3) * PRIORITY_SCORE_BASE + 3,
      ]);
    });

    it('shifts a delayed retry that sits below the old virtual time and floors an overdue one at zero, keeping their order', async () => {
      const { redis, allocator, seedJob, readPriority, readStampedBase } =
        await createAllocator();

      await redis.set(VIRTUAL_TIME_KEY, FAIR_REBASE_THRESHOLD - 1);
      await seedJob({
        jobId: 'retrying',
        priority: ticketOf(FAIR_REBASE_THRESHOLD - FAIR_REBASE_STEP + 100),
        counter: 1,
        state: 'delayed',
      });
      await seedJob({
        jobId: 'overdue',
        priority: ticketOf(100),
        counter: 2,
        state: 'delayed',
      });
      await seedJob({
        jobId: 'running',
        priority: ticketOf(FAIR_REBASE_THRESHOLD),
        counter: 3,
        state: 'active',
      });

      await allocator.recordDispatch({ queueName: QUEUE, jobId: 'running' });
      await allocator.rebase(QUEUE);

      expect(await readPriority('retrying')).toBe(ticketOf(100));
      expect(await readStampedBase('retrying')).toBe(FAIR_REBASE_STEP);
      expect(await readPriority('overdue')).toBe(ticketOf(0));
      expect(await readStampedBase('overdue')).toBe(FAIR_REBASE_STEP);
    });

    it('leaves a job already on the new scale and a ticket allocated before the base existed alone', async () => {
      const { redis, allocator, seedJob, readPriority, readStampedBase } =
        await createAllocator();

      await redis.set(VIRTUAL_TIME_KEY, FAIR_REBASE_THRESHOLD - 1);
      await seedJob({
        jobId: 'fresh',
        priority: ticketOf(FAIR_REBASE_THRESHOLD - FAIR_REBASE_STEP + 5),
        counter: 1,
        state: 'prioritized',
        base: FAIR_REBASE_STEP,
      });
      await seedJob({
        jobId: 'stamped',
        priority: ticketOf(FAIR_REBASE_THRESHOLD - FAIR_REBASE_STEP + 6),
        counter: 2,
        state: 'prioritized',
        stampedBase: FAIR_REBASE_STEP,
      });
      await seedJob({
        jobId: 'legacy',
        priority: ticketOf(FAIR_REBASE_THRESHOLD + 2),
        counter: 3,
        state: 'prioritized',
        base: 'none',
      });
      await seedJob({
        jobId: 'old',
        priority: ticketOf(FAIR_REBASE_THRESHOLD + 3),
        counter: 4,
        state: 'prioritized',
      });
      await seedJob({
        jobId: 'running',
        priority: ticketOf(FAIR_REBASE_THRESHOLD),
        counter: 5,
        state: 'active',
      });

      await allocator.recordDispatch({ queueName: QUEUE, jobId: 'running' });
      await allocator.rebase(QUEUE);

      expect(await readPriority('old')).toBe(
        ticketOf(FAIR_REBASE_THRESHOLD + 3 - FAIR_REBASE_STEP),
      );
      expect(await readPriority('fresh')).toBe(
        ticketOf(FAIR_REBASE_THRESHOLD - FAIR_REBASE_STEP + 5),
      );
      expect(await readPriority('stamped')).toBe(
        ticketOf(FAIR_REBASE_THRESHOLD - FAIR_REBASE_STEP + 6),
      );
      expect(await readPriority('legacy')).toBe(
        ticketOf(FAIR_REBASE_THRESHOLD + 2),
      );
      expect(await readStampedBase('legacy')).toBeUndefined();
    });

    it('dispatches a job fetched before the switch without switching the scale again', async () => {
      const {
        redis,
        allocator,
        seedJob,
        readPriority,
        readVirtualTime,
        readBase,
        isRebasing,
      } = await createAllocator();

      await redis.set(VIRTUAL_TIME_KEY, FAIR_REBASE_THRESHOLD - 1);
      await seedJob({
        jobId: 'j1',
        priority: ticketOf(FAIR_REBASE_THRESHOLD),
        counter: 1,
        state: 'active',
      });
      await seedJob({
        jobId: 'j2',
        priority: ticketOf(FAIR_REBASE_THRESHOLD + 3),
        counter: 2,
        state: 'active',
      });

      await allocator.recordDispatch({ queueName: QUEUE, jobId: 'j1' });
      await allocator.rebase(QUEUE);
      await allocator.recordDispatch({ queueName: QUEUE, jobId: 'j2' });

      expect(await readBase()).toBe(FAIR_REBASE_STEP);
      expect(await readVirtualTime()).toBe(
        FAIR_REBASE_THRESHOLD + 3 - FAIR_REBASE_STEP,
      );
      expect(await readPriority('j2')).toBe(
        ticketOf(FAIR_REBASE_THRESHOLD + 3 - FAIR_REBASE_STEP),
      );
      expect(await isRebasing()).toBe(false);
    });

    it('normalizes a ticket allocated before the switch and inserted after it', async () => {
      const {
        redis,
        allocator,
        seedJob,
        readPriority,
        readStampedBase,
        readPrioritizedWithScores,
        isRebasing,
      } = await createAllocator({ rebaseGraceMs: 50 });

      await redis.set(VIRTUAL_TIME_KEY, FAIR_REBASE_THRESHOLD - 1);
      await seedJob({
        jobId: 'x',
        priority: ticketOf(FAIR_REBASE_THRESHOLD),
        counter: 1,
        state: 'active',
      });

      const allocation = await allocator.allocateTickets({
        queueName: QUEUE,
        requests: [{ groupKeys: ['workspace:late'], jobCount: 1 }],
      });

      expect(allocation).toEqual({
        base: 0,
        tickets: [{ tag: FAIR_REBASE_THRESHOLD - 1, weight: 1 }],
      });

      await allocator.recordDispatch({ queueName: QUEUE, jobId: 'x' });
      await seedJob({
        jobId: 'late',
        priority: ticketOf(FAIR_REBASE_THRESHOLD - 1),
        counter: 9,
        state: 'prioritized',
      });
      await allocator.rebase(QUEUE);

      expect(await readPriority('late')).toBe(
        ticketOf(FAIR_REBASE_THRESHOLD - 1 - FAIR_REBASE_STEP),
      );
      expect(await readStampedBase('late')).toBe(FAIR_REBASE_STEP);
      expect(await readPrioritizedWithScores()).toEqual([
        'late',
        ticketOf(FAIR_REBASE_THRESHOLD - 1 - FAIR_REBASE_STEP) *
          PRIORITY_SCORE_BASE +
          9,
      ]);
      expect(await isRebasing()).toBe(false);
    });

    it('shifts a ticket allocated on an older scale at dispatch and stamps the job', async () => {
      const {
        redis,
        allocator,
        seedJob,
        readPriority,
        readStampedBase,
        readVirtualTime,
        readBase,
        isRebasing,
      } = await createAllocator();

      await redis.set(
        VIRTUAL_TIME_KEY,
        FAIR_REBASE_THRESHOLD - FAIR_REBASE_STEP,
      );
      await redis.set(BASE_KEY, FAIR_REBASE_STEP);
      await seedJob({
        jobId: 'stray',
        priority: ticketOf(FAIR_REBASE_THRESHOLD + 5),
        counter: 1,
        state: 'active',
      });

      await allocator.recordDispatch({ queueName: QUEUE, jobId: 'stray' });

      expect(await readPriority('stray')).toBe(
        ticketOf(FAIR_REBASE_THRESHOLD + 5 - FAIR_REBASE_STEP),
      );
      expect(await readStampedBase('stray')).toBe(FAIR_REBASE_STEP);
      expect(await readVirtualTime()).toBe(
        FAIR_REBASE_THRESHOLD + 5 - FAIR_REBASE_STEP,
      );
      expect(await readBase()).toBe(FAIR_REBASE_STEP);
      expect(await isRebasing()).toBe(false);
    });

    it('swallows a Redis failure', async () => {
      await expect(
        createBrokenAllocator().recordDispatch({
          queueName: QUEUE,
          jobId: 'j',
        }),
      ).resolves.toBeUndefined();
    });
  });
});
