import { Logger } from '@nestjs/common';

import { type Job, PRIORITY_LIMIT } from 'bullmq';
import { type Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';
import { isDefined } from 'twenty-shared/utils';

import { BullMQDriver } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import { FAIR_TICKET_OFFSET } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';
import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type ScenarioJobData = { label: string; workspaceId?: string };

type StoredJobOptions = {
  jobId?: string;
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: { type: string; delay: number };
};

type StoredJob = {
  id: string;
  name: string;
  data: ScenarioJobData;
  options: StoredJobOptions;
  timestamp: number;
  insertionIndex: number;
  attemptsMade: number;
  isPromoted: boolean;
};

type JobToStore = {
  id?: string;
  name: string;
  data: ScenarioJobData;
  options: StoredJobOptions;
  attemptsMade?: number;
};

type SchedulerTemplate = {
  name: string;
  data: ScenarioJobData;
  options: StoredJobOptions;
};

type RedisClientDouble = {
  runCommand: (name: string, args: (string | number)[]) => Promise<unknown>;
};

type BullMQDouble = {
  now: number;
  jobs: StoredJob[];
  schedulers: SchedulerTemplate[];
  nextInsertionIndex: number;
  processor: ((job: Job) => Promise<void>) | undefined;
  client: RedisClientDouble | undefined;
  redis: Redis | undefined;
  store: (jobToStore: JobToStore) => Promise<{ id: string }>;
  takeNext: () => Promise<StoredJob | undefined>;
  release: (job: StoredJob) => Promise<void>;
  refreshPriorities: () => Promise<void>;
  reset: (store: { redis: Redis; client: RedisClientDouble }) => void;
};

const QUEUE = MessageQueue.logicFunctionQueue;
const KEY_PREFIX = 'bull';
const QUEUE_KEY_PREFIX = `${KEY_PREFIX}:${QUEUE}:`;
const JOB_NAME = 'scenario-job';
const FAIRNESS_FLAG = 'IS_WORKER_FAIRNESS_ENABLED';
const VIRTUAL_TIME_KEY = `${QUEUE_KEY_PREFIX}fair:vtime`;
const PRIORITIZED_KEY = `${QUEUE_KEY_PREFIX}prioritized`;
const DELAYED_KEY = `${QUEUE_KEY_PREFIX}delayed`;
const ACTIVE_KEY = `${QUEUE_KEY_PREFIX}active`;
export const PRIORITY_SCORE_BASE = 2 ** 32;

const buildJobKey = (jobId: string) => `${QUEUE_KEY_PREFIX}${jobId}`;

const addToPrioritized = async ({
  jobId,
  priority,
  insertionIndex,
}: {
  jobId: string;
  priority: number;
  insertionIndex: number;
}) =>
  mockBullMQ.redis?.zadd(
    PRIORITIZED_KEY,
    priority * PRIORITY_SCORE_BASE + insertionIndex,
    jobId,
  );

const mockBullMQ: BullMQDouble = {
  now: 0,
  jobs: [],
  schedulers: [],
  nextInsertionIndex: 0,
  processor: undefined,
  client: undefined,
  redis: undefined,
  store: async ({ id, name, data, options, attemptsMade = 0 }) => {
    const priority = options.priority ?? 0;

    if (
      !Number.isInteger(priority) ||
      priority < 0 ||
      priority > PRIORITY_LIMIT
    ) {
      throw new Error(`BullMQ rejects the priority ${priority}`);
    }

    const job: StoredJob = {
      id: id ?? options.jobId ?? `job-${mockBullMQ.nextInsertionIndex}`,
      name,
      data,
      options,
      timestamp: mockBullMQ.now,
      insertionIndex: mockBullMQ.nextInsertionIndex,
      attemptsMade,
      isPromoted: (options.delay ?? 0) === 0,
    };

    mockBullMQ.nextInsertionIndex += 1;
    mockBullMQ.jobs.push(job);

    await mockBullMQ.redis?.hset(buildJobKey(job.id), 'priority', priority);
    await mockBullMQ.redis?.hset(
      buildJobKey(job.id),
      'opts',
      JSON.stringify(options),
    );

    if (!job.isPromoted) {
      await mockBullMQ.redis?.zadd(DELAYED_KEY, job.timestamp, job.id);
    } else if (priority > 0) {
      await addToPrioritized({
        jobId: job.id,
        priority,
        insertionIndex: job.insertionIndex,
      });
    }

    return { id: job.id };
  },
  takeNext: async () => {
    const eligibleJobs = mockBullMQ.jobs.filter(
      (job) => job.timestamp + (job.options.delay ?? 0) <= mockBullMQ.now,
    );

    for (const job of eligibleJobs) {
      if (!job.isPromoted) {
        job.isPromoted = true;
        job.insertionIndex = mockBullMQ.nextInsertionIndex;
        mockBullMQ.nextInsertionIndex += 1;

        await mockBullMQ.redis?.zrem(DELAYED_KEY, job.id);

        if ((job.options.priority ?? 0) > 0) {
          await addToPrioritized({
            jobId: job.id,
            priority: job.options.priority ?? 0,
            insertionIndex: job.insertionIndex,
          });
        }
      }
    }

    const [next] = [...eligibleJobs].sort(
      (left, right) =>
        (left.options.priority ?? 0) - (right.options.priority ?? 0) ||
        left.insertionIndex - right.insertionIndex,
    );

    if (!isDefined(next)) {
      return undefined;
    }

    mockBullMQ.jobs = mockBullMQ.jobs.filter((job) => job !== next);

    await mockBullMQ.redis?.zrem(PRIORITIZED_KEY, next.id);
    await mockBullMQ.redis?.rpush(ACTIVE_KEY, next.id);

    return next;
  },
  release: async (job) => {
    await mockBullMQ.redis?.lrem(ACTIVE_KEY, 0, job.id);
  },
  refreshPriorities: async () => {
    for (const job of mockBullMQ.jobs) {
      const priority = await mockBullMQ.redis?.hget(
        buildJobKey(job.id),
        'priority',
      );

      if (isDefined(priority)) {
        job.options.priority = Number(priority);
      }
    }
  },
  reset: ({ redis, client }) => {
    mockBullMQ.now = Date.now();
    mockBullMQ.jobs = [];
    mockBullMQ.schedulers = [];
    mockBullMQ.nextInsertionIndex = 0;
    mockBullMQ.processor = undefined;
    mockBullMQ.client = client;
    mockBullMQ.redis = redis;
  },
};

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    get client() {
      return Promise.resolve(mockBullMQ.client);
    },
    toKey: (type: string) => `${QUEUE_KEY_PREFIX}${type}`,
    add: async (
      name: string,
      data: ScenarioJobData,
      options: StoredJobOptions,
    ) => mockBullMQ.store({ name, data, options }),
    addBulk: async (
      jobs: { name: string; data: ScenarioJobData; opts: StoredJobOptions }[],
    ) => {
      const storedJobs: { id: string }[] = [];

      for (const { name, data, opts } of jobs) {
        storedJobs.push(await mockBullMQ.store({ name, data, options: opts }));
      }

      return storedJobs;
    },
    getRanges: async () => mockBullMQ.jobs.map((job) => job.id),
    upsertJobScheduler: async (
      _schedulerId: string,
      _repeat: unknown,
      template: { name: string; data: ScenarioJobData; opts: StoredJobOptions },
    ) => {
      mockBullMQ.schedulers.push({
        name: template.name,
        data: template.data,
        options: template.opts,
      });
    },
    setGlobalConcurrency: async () => undefined,
    removeGlobalConcurrency: async () => undefined,
  })),
  Worker: jest
    .fn()
    .mockImplementation(
      (_queueName: string, processor: (job: Job) => Promise<void>) => {
        mockBullMQ.processor = processor;

        return { on: () => undefined };
      },
    ),
  MetricsTime: { ONE_WEEK: 1 },
  PRIORITY_LIMIT:
    jest.requireActual<typeof import('bullmq')>('bullmq').PRIORITY_LIMIT,
}));

const flushAsyncWork = async () => {
  for (let round = 0; round < 30; round += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
};

export const silenceDriverLogs = () => {
  jest.useRealTimers();
  jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
};

export const buildLabels = ({
  prefix,
  count,
  from = 1,
}: {
  prefix: string;
  count: number;
  from?: number;
}) => Array.from({ length: count }, (_, index) => `${prefix}${from + index}`);

export const ticketOf = (tag: number) => FAIR_TICKET_OFFSET + tag;

const createRedisClientDouble = (redis: Redis): RedisClientDouble => ({
  runCommand: async (name, args) => {
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

    return redis.eval(String(script), Number(numberOfKeys), ...scriptArguments);
  },
});

type EnqueueInput = { label: string; workspaceId?: string } & Pick<
  QueueJobOptions,
  'groupKeys' | 'priority' | 'delay' | 'id' | 'retryLimit' | 'backoff'
>;

export const createFairnessHarness = async ({
  isFairnessEnabled: initialFairnessEnabled,
}: {
  isFairnessEnabled: boolean;
}) => {
  const redis: Redis = new RedisMock();

  await redis.flushall();
  mockBullMQ.reset({ redis, client: createRedisClientDouble(redis) });

  let isFairnessEnabled = initialFairnessEnabled;
  const metricsService = {
    recordHistogram: jest.fn(),
    incrementCounterForEvent: jest.fn().mockResolvedValue(undefined),
  };
  const driver = new BullMQDriver(
    { prefix: KEY_PREFIX, connection: {} },
    metricsService as never,
    {
      get: (key: string) =>
        key === FAIRNESS_FLAG ? isFairnessEnabled : undefined,
    } as never,
    { emit: jest.fn() } as never,
  );

  driver.register(QUEUE);

  const processedLabels: string[] = [];
  const remainingFailures = new Map<string, number>();

  driver.work<ScenarioJobData>(QUEUE, async ({ data }) => {
    processedLabels.push(data.label);

    const failures = remainingFailures.get(data.label) ?? 0;

    if (failures > 0) {
      remainingFailures.set(data.label, failures - 1);
      throw new Error(`${data.label} failed`);
    }
  });
  await flushAsyncWork();

  const processOne = async (): Promise<boolean> => {
    const job = await mockBullMQ.takeNext();

    if (!isDefined(job) || !isDefined(mockBullMQ.processor)) {
      return false;
    }

    try {
      await mockBullMQ.processor({
        ...job,
        opts: job.options,
        priority: job.options.priority ?? 0,
        attemptsStarted: job.attemptsMade + 1,
        updateData: jest.fn(),
        updateProgress: jest.fn(),
      } as unknown as Job);
    } catch {
      if (job.attemptsMade + 1 < (job.options.attempts ?? 1)) {
        await flushAsyncWork();

        const priority = await redis.hget(buildJobKey(job.id), 'priority');

        await mockBullMQ.store({
          id: job.id,
          name: job.name,
          data: job.data,
          options: {
            ...job.options,
            priority: isDefined(priority) ? Number(priority) : undefined,
            delay: job.options.backoff?.delay ?? 0,
          },
          attemptsMade: job.attemptsMade + 1,
        });
      }
    }
    await flushAsyncWork();
    await mockBullMQ.release(job);
    await mockBullMQ.refreshPriorities();

    return true;
  };

  const enqueue = async ({ label, workspaceId, ...options }: EnqueueInput) => {
    await driver.add<ScenarioJobData>(
      QUEUE,
      JOB_NAME,
      { label, workspaceId },
      options,
    );
  };

  return {
    metricsService,
    enqueue,
    enqueueMany: async ({
      labels,
      ...options
    }: { labels: string[] } & Omit<EnqueueInput, 'label'>) => {
      for (const label of labels) {
        await enqueue({ label, ...options });
      }
    },
    enqueueBulk: async ({
      labels,
      workspaceId,
      groupKeys,
    }: {
      labels: string[];
      workspaceId: string;
      groupKeys?: string[];
    }) => {
      await driver.bulkAdd<ScenarioJobData>(
        QUEUE,
        JOB_NAME,
        labels.map((label) => ({ data: { label, workspaceId } })),
        isDefined(groupKeys) ? { groupKeys } : undefined,
      );
    },
    scheduleCron: async ({
      label,
      every,
    }: {
      label: string;
      every: number;
    }) => {
      await driver.addCron<ScenarioJobData>({
        queueName: QUEUE,
        jobName: JOB_NAME,
        data: { label },
        options: { repeat: { every } },
      });
    },
    fireCrons: async () => {
      for (const scheduler of mockBullMQ.schedulers) {
        await mockBullMQ.store(scheduler);
      }
    },
    processNext: async (count: number) => {
      const alreadyProcessed = processedLabels.length;

      for (let index = 0; index < count; index += 1) {
        if (!(await processOne())) {
          break;
        }
      }

      return processedLabels.slice(alreadyProcessed);
    },
    processAll: async () => {
      const alreadyProcessed = processedLabels.length;
      let hasProcessedJob = await processOne();

      while (hasProcessedJob) {
        hasProcessedJob = await processOne();
      }

      return processedLabels.slice(alreadyProcessed);
    },
    advanceTime: ({ milliseconds }: { milliseconds: number }) => {
      mockBullMQ.now += milliseconds;
    },
    setFairnessEnabled: (value: boolean) => {
      isFairnessEnabled = value;
    },
    failNextAttempts: ({ label, count }: { label: string; count: number }) => {
      remainingFailures.set(label, count);
    },
    setWeight: async ({
      groupKey,
      weight,
    }: {
      groupKey: string;
      weight: number;
    }) => {
      await redis.hset(`${QUEUE_KEY_PREFIX}fair:weights`, groupKey, weight);
    },
    setVirtualTime: async ({ value }: { value: number }) => {
      await redis.set(VIRTUAL_TIME_KEY, value);
    },
    readVirtualTime: async () =>
      Number((await redis.get(VIRTUAL_TIME_KEY)) ?? 0),
    readClock: async ({ groupKey }: { groupKey: string }) => {
      const clock = await redis.get(
        `${QUEUE_KEY_PREFIX}fair:clock:${groupKey}`,
      );

      return isDefined(clock) ? Number(clock.split(':')[1]) : undefined;
    },
    readPriority: ({ label }: { label: string }) =>
      mockBullMQ.jobs.find((job) => job.data.label === label)?.options.priority,
    breakRedis: () => {
      const runCommand = jest
        .fn()
        .mockRejectedValue(new Error('Redis connection lost'));

      mockBullMQ.client = { runCommand };

      return runCommand;
    },
  };
};

export type FairnessHarness = Awaited<ReturnType<typeof createFairnessHarness>>;
