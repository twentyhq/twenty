import { readFileSync } from 'node:fs';

import { Logger } from '@nestjs/common';

import { type Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';

import { FairPriorityTagger } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority-tagger';
import {
  FAIR_REBASE_STEP,
  FAIR_REBASE_THRESHOLD,
  FAIR_TICKET_OFFSET,
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
// BullMQ scores a prioritized job by priority * 2^32 + insertion counter
const PRIORITY_SCORE_BASE = 2 ** 32;
const BULLMQ_PRIORITY_SCORE_LUA =
  require.resolve('bullmq/dist/cjs/commands/includes/getPriorityScore.lua');
const THRESHOLD = FAIR_REBASE_THRESHOLD;
const STEP = FAIR_REBASE_STEP;

const ticketOf = (tag: number) => FAIR_TICKET_OFFSET + tag;

// ioredis-mock instances share one store, so each test starts from an empty one
const createTagger = async ({
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
  }: {
    jobId: string;
    priority: number;
    counter: number;
    state: 'prioritized' | 'delayed' | 'active';
  }) => {
    await redis.hset(`${QUEUE_KEY_PREFIX}${jobId}`, 'priority', priority);

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
    tagger: new FairPriorityTagger({
      getClient: async () => client as never,
      keyPrefix: KEY_PREFIX,
      rebaseGraceMs,
    }),
    seedJob,
    readClock: async (groupKey: string) => {
      const raw = await redis.get(`${QUEUE_KEY_PREFIX}fair:clock:${groupKey}`);

      return raw?.split(':').map(Number);
    },
    readPriority: async (jobId: string) =>
      Number(await redis.hget(`${QUEUE_KEY_PREFIX}${jobId}`, 'priority')),
    readVirtualTime: async () => Number(await redis.get(VIRTUAL_TIME_KEY)),
    readBase: async () => Number((await redis.get(BASE_KEY)) ?? 0),
    readPrioritizedWithScores: async () =>
      (await redis.zrange(PRIORITIZED_KEY, 0, -1, 'WITHSCORES')).map(
        (value, index) => (index % 2 === 1 ? Number(value) : value),
      ),
  };
};

const createBrokenTagger = () =>
  new FairPriorityTagger({
    getClient: async () => {
      throw new Error('Redis connection lost');
    },
    keyPrefix: KEY_PREFIX,
  });

describe('FairPriorityTagger', () => {
  beforeAll(() => {
    jest.useRealTimers();
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  describe('reserve', () => {
    it('tags a reservation at its latest clock and charges each key for its own batch only', async () => {
      const { tagger, readClock } = await createTagger();

      expect(
        await tagger.reserve({
          queueName: QUEUE,
          reservations: [
            { groupKeys: ['workspace:X', 'application:H'], batchSize: 100 },
            { groupKeys: ['workspace:W', 'application:H'], batchSize: 1 },
            { groupKeys: ['workspace:W', 'application:Q'], batchSize: 1 },
          ],
        }),
      ).toEqual([
        { tag: 0, weight: 1 },
        { tag: 100, weight: 1 },
        { tag: 1, weight: 1 },
      ]);
      expect(await readClock('application:H')).toEqual([0, 101]);
      expect(await readClock('workspace:W')).toEqual([0, 2]);
    });

    it('tags a reservation at the virtual time when it is ahead of its clocks', async () => {
      const { redis, tagger, readClock } = await createTagger();

      await redis.set(VIRTUAL_TIME_KEY, 5);

      expect(
        await tagger.reserve({
          queueName: QUEUE,
          reservations: [{ groupKeys: ['workspace:B'], batchSize: 2 }],
        }),
      ).toEqual([{ tag: 5, weight: 1 }]);
      expect(await readClock('workspace:B')).toEqual([0, 7]);
    });

    it('weighs a reservation by the product of its key weights and ignores a malformed weight', async () => {
      const { redis, tagger } = await createTagger();

      await redis.hset(WEIGHTS_KEY, 'application:P', '2');
      await redis.hset(WEIGHTS_KEY, 'workspace:W', 'not-a-number');
      await redis.hset(WEIGHTS_KEY, 'application:N', '-1');

      expect(
        await tagger.reserve({
          queueName: QUEUE,
          reservations: [
            { groupKeys: ['workspace:W', 'application:P'], batchSize: 2 },
            { groupKeys: ['workspace:W', 'application:N'], batchSize: 1 },
          ],
        }),
      ).toEqual([
        { tag: 0, weight: 2 },
        { tag: 1, weight: 1 },
      ]);
    });

    it('returns nothing when Redis is unavailable', async () => {
      expect(
        await createBrokenTagger().reserve({
          queueName: QUEUE,
          reservations: [{ groupKeys: ['workspace:A'], batchSize: 1 }],
        }),
      ).toBeUndefined();
    });
  });

  describe('dispatched', () => {
    // The rebase rewrites BullMQ's prioritized scores in place, so it is pinned to the score layout BullMQ ships
    it('relies on the priority score layout of the installed BullMQ', () => {
      expect(readFileSync(BULLMQ_PRIORITY_SCORE_LUA, 'utf8')).toContain(
        'priority * 0x100000000 + prioCounter % 0x100000000',
      );
    });

    it('advances the virtual time from the dispatched job hash and leaves urgent and missing jobs alone', async () => {
      const { tagger, seedJob, readVirtualTime } = await createTagger();

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

      await tagger.dispatched({ queueName: QUEUE, jobId: 'A1' });
      await tagger.dispatched({ queueName: QUEUE, jobId: 'urgent' });
      await tagger.dispatched({ queueName: QUEUE, jobId: 'missing' });

      expect(await readVirtualTime()).toBe(5);
      expect(
        await tagger.reserve({
          queueName: QUEUE,
          reservations: [{ groupKeys: ['workspace:B'], batchSize: 1 }],
        }),
      ).toEqual([{ tag: 5, weight: 1 }]);
    });

    it('never moves the virtual time back', async () => {
      const { tagger, seedJob, readVirtualTime } = await createTagger();

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

      await tagger.dispatched({ queueName: QUEUE, jobId: 'late' });
      await tagger.dispatched({ queueName: QUEUE, jobId: 'early' });

      expect(await readVirtualTime()).toBe(9);
    });

    it('rewrites the waiting tickets in chunks once the threshold is passed, keeping the order and leaving urgent and static priorities alone', async () => {
      const {
        redis,
        tagger,
        seedJob,
        readPriority,
        readVirtualTime,
        readBase,
        readPrioritizedWithScores,
        readClock,
      } = await createTagger();
      const fillerCount = 1200;

      await redis.set(VIRTUAL_TIME_KEY, THRESHOLD - 1);
      await redis.set(
        `${QUEUE_KEY_PREFIX}fair:clock:workspace:A`,
        `0:${THRESHOLD + 3}`,
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
      });
      await seedJob({
        jobId: 'A2',
        priority: ticketOf(THRESHOLD + 1),
        counter: 3,
        state: 'prioritized',
      });
      await seedJob({
        jobId: 'A3',
        priority: ticketOf(THRESHOLD + 2),
        counter: 4,
        state: 'prioritized',
      });
      for (let index = 0; index < fillerCount; index += 1) {
        await seedJob({
          jobId: `F${index}`,
          priority: ticketOf(THRESHOLD + 10 + index),
          counter: 100 + index,
          state: 'prioritized',
        });
      }
      await seedJob({
        jobId: 'retrying',
        priority: ticketOf(THRESHOLD + 5),
        counter: 5,
        state: 'delayed',
      });
      await seedJob({
        jobId: 'running',
        priority: ticketOf(THRESHOLD),
        counter: 6,
        state: 'active',
      });

      await tagger.dispatched({ queueName: QUEUE, jobId: 'running' });
      await tagger.rebase(QUEUE);

      expect(await readVirtualTime()).toBe(THRESHOLD - STEP);
      expect(await readBase()).toBe(STEP);
      expect(await redis.get(REBASE_KEY)).toBeNull();
      expect((await readPrioritizedWithScores()).slice(0, 8)).toEqual([
        'urgent',
        URGENT_FAIR_PRIORITY * PRIORITY_SCORE_BASE + 1,
        'static',
        4 * PRIORITY_SCORE_BASE + 2,
        'A2',
        ticketOf(THRESHOLD + 1 - STEP) * PRIORITY_SCORE_BASE + 3,
        'A3',
        ticketOf(THRESHOLD + 2 - STEP) * PRIORITY_SCORE_BASE + 4,
      ]);
      expect(await redis.zcard(PRIORITIZED_KEY)).toBe(fillerCount + 4);
      expect(await readPriority(`F${fillerCount - 1}`)).toBe(
        ticketOf(THRESHOLD + 10 + fillerCount - 1 - STEP),
      );
      expect(await readPriority('static')).toBe(4);
      expect(await readPriority('retrying')).toBe(
        ticketOf(THRESHOLD + 5 - STEP),
      );
      expect(await readPriority('running')).toBe(ticketOf(THRESHOLD - STEP));
      expect(
        await tagger.reserve({
          queueName: QUEUE,
          reservations: [{ groupKeys: ['workspace:A'], batchSize: 1 }],
        }),
      ).toEqual([{ tag: THRESHOLD + 3 - STEP, weight: 1 }]);
      expect(await readClock('workspace:A')).toEqual([
        STEP,
        THRESHOLD + 4 - STEP,
      ]);
    });

    it('dispatches a job fetched before the switch without switching the scale again', async () => {
      const {
        redis,
        tagger,
        seedJob,
        readPriority,
        readVirtualTime,
        readBase,
      } = await createTagger();

      await redis.set(VIRTUAL_TIME_KEY, THRESHOLD - 1);
      await seedJob({
        jobId: 'j1',
        priority: ticketOf(THRESHOLD),
        counter: 1,
        state: 'active',
      });
      await seedJob({
        jobId: 'j2',
        priority: ticketOf(THRESHOLD + 3),
        counter: 2,
        state: 'active',
      });

      await tagger.dispatched({ queueName: QUEUE, jobId: 'j1' });
      await tagger.rebase(QUEUE);
      await tagger.dispatched({ queueName: QUEUE, jobId: 'j2' });

      expect(await readBase()).toBe(STEP);
      expect(await readVirtualTime()).toBe(THRESHOLD + 3 - STEP);
      expect(await readPriority('j2')).toBe(ticketOf(THRESHOLD + 3 - STEP));
      expect(await redis.get(REBASE_KEY)).toBeNull();
    });

    it('normalizes a ticket reserved before the switch and inserted after it', async () => {
      const {
        redis,
        tagger,
        seedJob,
        readPriority,
        readPrioritizedWithScores,
      } = await createTagger({ rebaseGraceMs: 50 });

      await redis.set(VIRTUAL_TIME_KEY, THRESHOLD - 1);
      await seedJob({
        jobId: 'x',
        priority: ticketOf(THRESHOLD),
        counter: 1,
        state: 'active',
      });

      const reservation = await tagger.reserve({
        queueName: QUEUE,
        reservations: [{ groupKeys: ['workspace:late'], batchSize: 1 }],
      });

      expect(reservation).toEqual([{ tag: THRESHOLD - 1, weight: 1 }]);

      await tagger.dispatched({ queueName: QUEUE, jobId: 'x' });
      await seedJob({
        jobId: 'late',
        priority: ticketOf(THRESHOLD - 1),
        counter: 9,
        state: 'prioritized',
      });
      await tagger.rebase(QUEUE);

      expect(await readPriority('late')).toBe(ticketOf(THRESHOLD - 1 - STEP));
      expect(await readPrioritizedWithScores()).toEqual([
        'late',
        ticketOf(THRESHOLD - 1 - STEP) * PRIORITY_SCORE_BASE + 9,
      ]);
      expect(await redis.get(REBASE_KEY)).toBeNull();
    });

    it('reads a stray old-scale ticket one step down after the rebase instead of switching again', async () => {
      const {
        redis,
        tagger,
        seedJob,
        readPriority,
        readVirtualTime,
        readBase,
      } = await createTagger();

      await redis.set(VIRTUAL_TIME_KEY, THRESHOLD - STEP);
      await redis.set(BASE_KEY, STEP);
      await seedJob({
        jobId: 'stray',
        priority: ticketOf(THRESHOLD + 5),
        counter: 1,
        state: 'active',
      });

      await tagger.dispatched({ queueName: QUEUE, jobId: 'stray' });

      expect(await readPriority('stray')).toBe(ticketOf(THRESHOLD + 5 - STEP));
      expect(await readVirtualTime()).toBe(THRESHOLD + 5 - STEP);
      expect(await readBase()).toBe(STEP);
      expect(await redis.get(REBASE_KEY)).toBeNull();
    });

    it('swallows a Redis failure', async () => {
      await expect(
        createBrokenTagger().dispatched({ queueName: QUEUE, jobId: 'j' }),
      ).resolves.toBeUndefined();
    });
  });
});
