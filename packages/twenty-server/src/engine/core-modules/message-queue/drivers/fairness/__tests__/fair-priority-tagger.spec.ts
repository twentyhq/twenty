import { Logger } from '@nestjs/common';

import { type Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';

import { FairPriorityTagger } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority-tagger';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

const QUEUE = MessageQueue.logicFunctionQueue;
const KEY_PREFIX = 'bull';
const QUEUE_KEY_PREFIX = `${KEY_PREFIX}:${QUEUE}:`;
const VIRTUAL_TIME_KEY = `${QUEUE_KEY_PREFIX}fair:vtime`;
const WEIGHTS_KEY = `${QUEUE_KEY_PREFIX}fair:weights`;

// ioredis-mock instances share one store, so each test starts from an empty one
const createTagger = async () => {
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
    tagger: new FairPriorityTagger({
      getClient: async () => client as never,
      keyPrefix: KEY_PREFIX,
    }),
    readClock: async (groupKey: string) =>
      Number(await redis.get(`${QUEUE_KEY_PREFIX}fair:clock:${groupKey}`)),
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
      expect(await readClock('application:H')).toBe(101);
      expect(await readClock('workspace:W')).toBe(2);
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
      expect(await readClock('workspace:B')).toBe(7);
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
});
