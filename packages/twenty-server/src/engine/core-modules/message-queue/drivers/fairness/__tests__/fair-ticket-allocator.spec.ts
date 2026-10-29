import { Logger } from '@nestjs/common';

import { type Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';

import { FairTicketAllocator } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-ticket-allocator';
import {
  FAIR_TICKET_OFFSET,
  URGENT_FAIR_PRIORITY,
} from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

const QUEUE = MessageQueue.logicFunctionQueue;
const KEY_PREFIX = 'bull';
const QUEUE_KEY_PREFIX = `${KEY_PREFIX}:${QUEUE}:`;
const VIRTUAL_TIME_KEY = `${QUEUE_KEY_PREFIX}fair:vtime`;
const WEIGHTS_KEY = `${QUEUE_KEY_PREFIX}fair:weights`;

const ticketOf = (tag: number) => FAIR_TICKET_OFFSET + tag;

const jobKeyOf = (jobId: string) => `${QUEUE_KEY_PREFIX}${jobId}`;

const createAllocator = async () => {
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

  return {
    redis,
    allocator: new FairTicketAllocator({
      getClient: async () => client as never,
      getJobKey: ({ jobId }) => jobKeyOf(jobId),
      keyPrefix: KEY_PREFIX,
    }),
    readClock: async (groupKey: string) =>
      Number(await redis.get(`${QUEUE_KEY_PREFIX}fair:clock:${groupKey}`)),
    readVirtualTime: async () => Number(await redis.get(VIRTUAL_TIME_KEY)),
    seedJob: async ({ jobId, priority }: { jobId: string; priority: number }) =>
      redis.hset(jobKeyOf(jobId), 'priority', priority),
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
      ).toEqual([
        { tag: 0, weight: 1 },
        { tag: 100, weight: 1 },
        { tag: 1, weight: 1 },
      ]);
      expect(await readClock('application:H')).toBe(101);
      expect(await readClock('workspace:W')).toBe(2);
    });

    it('tags a request at the virtual time when it is ahead of its clocks', async () => {
      const { redis, allocator, readClock } = await createAllocator();

      await redis.set(VIRTUAL_TIME_KEY, 5);

      expect(
        await allocator.allocateTickets({
          queueName: QUEUE,
          requests: [{ groupKeys: ['workspace:B'], jobCount: 2 }],
        }),
      ).toEqual([{ tag: 5, weight: 1 }]);
      expect(await readClock('workspace:B')).toBe(7);
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
      ).toEqual([
        { tag: 0, weight: 2 },
        { tag: 1, weight: 1 },
      ]);
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
    it('advances the virtual time from the dispatched job hash and leaves urgent and missing jobs alone', async () => {
      const { allocator, seedJob, readVirtualTime } = await createAllocator();

      await seedJob({ jobId: 'A1', priority: ticketOf(5) });
      await seedJob({ jobId: 'urgent', priority: URGENT_FAIR_PRIORITY });

      await allocator.recordDispatch({ queueName: QUEUE, jobId: 'A1' });
      await allocator.recordDispatch({ queueName: QUEUE, jobId: 'urgent' });
      await allocator.recordDispatch({ queueName: QUEUE, jobId: 'missing' });

      expect(await readVirtualTime()).toBe(5);
      expect(
        await allocator.allocateTickets({
          queueName: QUEUE,
          requests: [{ groupKeys: ['workspace:B'], jobCount: 1 }],
        }),
      ).toEqual([{ tag: 5, weight: 1 }]);
    });

    it('never moves the virtual time back', async () => {
      const { allocator, seedJob, readVirtualTime } = await createAllocator();

      await seedJob({ jobId: 'late', priority: ticketOf(9) });
      await seedJob({ jobId: 'early', priority: ticketOf(3) });

      await allocator.recordDispatch({ queueName: QUEUE, jobId: 'late' });
      await allocator.recordDispatch({ queueName: QUEUE, jobId: 'early' });

      expect(await readVirtualTime()).toBe(9);
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
