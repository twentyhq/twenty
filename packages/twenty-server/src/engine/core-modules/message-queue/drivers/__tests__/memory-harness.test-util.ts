import { Logger } from '@nestjs/common';

import { UnrecoverableError } from 'bullmq';
import { type Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';
import { isDefined } from 'twenty-shared/utils';

import { BullMQDriver } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import {
  type QueueJobOptions,
  type QueueJobSettings,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type QueueJobToAdd } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import { type MessageQueueJob } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export const MEMORY_SCENARIO_QUEUE = MessageQueue.logicFunctionQueue;

const KEY_PREFIX = 'bull';
const QUEUE_KEY_PREFIX = `${KEY_PREFIX}:${MEMORY_SCENARIO_QUEUE}:`;
const USED_KEY_PREFIX = `${KEY_PREFIX}:jobmem:used:`;
const JOBS_KEY_PREFIX = `${KEY_PREFIX}:jobmem:jobs:`;
export const MEMORY_SCENARIO_JOB_NAME = 'memory-scenario-job';

export type MemoryScenarioJobData = {
  label: string;
  workspaceId?: string;
  payload?: string;
};

type StoredJobOptions = {
  jobId?: string;
  attempts?: number;
  deduplication?: { id: string };
  memoryGroupKeys?: string[];
  memorySizeBytes?: number;
};

type StoredJob = {
  id: string;
  name: string;
  data: MemoryScenarioJobData;
  opts: StoredJobOptions;
  attemptsMade: number;
  finishedOn?: number;
};

export type AddFailure =
  | 'not-added'
  | 'added-but-unacknowledged'
  | 'unknown-outcome';

type WorkerListener = (job: object, error?: Error) => void;

type BullMQDouble = {
  jobs: Map<string, StoredJob>;
  waitingJobIds: string[];
  deduplicatedJobIds: Map<string, string>;
  nextJobIndex: number;
  nextAddFailure: AddFailure | undefined;
  isGetJobBroken: boolean;
  lockedJobIds: Set<string>;
  beforeRemove: (() => Promise<void>) | undefined;
  processor: ((job: object) => Promise<void>) | undefined;
  listeners: { event: string; listener: WorkerListener }[];
  client: unknown;
  redis: Redis | undefined;
  store: (job: { name: string; data: unknown; opts: unknown }) => Promise<{
    id: string;
  }>;
  addAll: (
    jobs: { name: string; data: unknown; opts: unknown }[],
  ) => Promise<{ id: string }[]>;
  remove: (jobId: string) => Promise<void>;
  reset: (store: { redis: Redis; client: unknown }) => void;
};

const buildJobKey = (jobId: string) => `${QUEUE_KEY_PREFIX}${jobId}`;

const mockBullMQ: BullMQDouble = {
  jobs: new Map(),
  waitingJobIds: [],
  deduplicatedJobIds: new Map(),
  nextJobIndex: 0,
  nextAddFailure: undefined,
  isGetJobBroken: false,
  lockedJobIds: new Set(),
  beforeRemove: undefined,
  processor: undefined,
  listeners: [],
  client: undefined,
  redis: undefined,
  store: async ({ name, data, opts }) => {
    const options = opts as StoredJobOptions;
    const deduplicationId = options.deduplication?.id;
    const deduplicatedJobId = isDefined(deduplicationId)
      ? mockBullMQ.deduplicatedJobIds.get(deduplicationId)
      : undefined;

    if (isDefined(deduplicatedJobId)) {
      return { id: deduplicatedJobId };
    }

    const id = options.jobId ?? `job-${(mockBullMQ.nextJobIndex += 1)}`;

    if (mockBullMQ.jobs.has(id)) {
      return { id };
    }

    mockBullMQ.jobs.set(id, {
      id,
      name,
      data: data as MemoryScenarioJobData,
      opts: options,
      attemptsMade: 0,
    });
    mockBullMQ.waitingJobIds.push(id);

    if (isDefined(deduplicationId)) {
      mockBullMQ.deduplicatedJobIds.set(deduplicationId, id);
    }

    await mockBullMQ.redis?.hset(buildJobKey(id), 'name', name);

    return { id };
  },
  addAll: async (jobs) => {
    const failure = mockBullMQ.nextAddFailure;

    mockBullMQ.nextAddFailure = undefined;

    if (failure === 'not-added' || failure === 'unknown-outcome') {
      throw new Error('connection lost');
    }

    const addedJobs = [];

    for (const job of jobs) {
      addedJobs.push(await mockBullMQ.store(job));
    }

    if (failure === 'added-but-unacknowledged') {
      throw new Error('connection lost');
    }

    return addedJobs;
  },
  remove: async (jobId) => {
    await mockBullMQ.beforeRemove?.();

    if (mockBullMQ.lockedJobIds.has(jobId)) {
      throw new Error(`Job ${jobId} is locked`);
    }

    mockBullMQ.jobs.delete(jobId);
    mockBullMQ.waitingJobIds = mockBullMQ.waitingJobIds.filter(
      (waitingJobId) => waitingJobId !== jobId,
    );
    await mockBullMQ.redis?.del(buildJobKey(jobId));
  },
  reset: ({ redis, client }) => {
    mockBullMQ.jobs = new Map();
    mockBullMQ.waitingJobIds = [];
    mockBullMQ.deduplicatedJobIds = new Map();
    mockBullMQ.nextJobIndex = 0;
    mockBullMQ.nextAddFailure = undefined;
    mockBullMQ.isGetJobBroken = false;
    mockBullMQ.lockedJobIds = new Set();
    mockBullMQ.beforeRemove = undefined;
    mockBullMQ.processor = undefined;
    mockBullMQ.listeners = [];
    mockBullMQ.redis = redis;
    mockBullMQ.client = client;
  },
};

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    get client() {
      return Promise.resolve(mockBullMQ.client);
    },
    toKey: (jobId: string) => buildJobKey(jobId),
    add: async (name: string, data: unknown, opts: unknown) => {
      const [job] = await mockBullMQ.addAll([{ name, data, opts }]);

      return job;
    },
    addBulk: (jobs: { name: string; data: unknown; opts: unknown }[]) =>
      mockBullMQ.addAll(jobs),
    getJob: async (jobId: string) => {
      if (mockBullMQ.isGetJobBroken) {
        throw new Error('connection lost');
      }

      const job = mockBullMQ.jobs.get(jobId);

      return isDefined(job)
        ? Object.assign(job, { remove: () => mockBullMQ.remove(jobId) })
        : undefined;
    },
    getRanges: async () => [...mockBullMQ.waitingJobIds],
    setGlobalConcurrency: jest.fn(),
    removeGlobalConcurrency: jest.fn(),
  })),
  Worker: jest
    .fn()
    .mockImplementation(
      (_queueName: string, processor: (job: object) => Promise<void>) => {
        mockBullMQ.processor = processor;

        return {
          on: (event: string, listener: WorkerListener) => {
            mockBullMQ.listeners.push({ event, listener });
          },
        };
      },
    ),
  MetricsTime: { ONE_WEEK: 1 },
  PRIORITY_LIMIT: jest.requireActual('bullmq').PRIORITY_LIMIT,
  UnrecoverableError: jest.requireActual('bullmq').UnrecoverableError,
}));

jest.mock(
  'src/engine/core-modules/message-queue/drivers/fairness/fair-ticket-allocator',
  () => ({
    FairTicketAllocator: jest.fn().mockImplementation(() => ({
      allocateTickets: jest.fn().mockResolvedValue(undefined),
      recordDispatch: jest.fn(),
    })),
  }),
);

jest.mock(
  'src/engine/core-modules/message-queue/constants/job-memory-limit.constant',
  () => ({
    ...jest.requireActual(
      'src/engine/core-modules/message-queue/constants/job-memory-limit.constant',
    ),
    JOB_MEMORY_INFO_CACHE_MS: 0,
  }),
);

export const silenceDriverLogs = () => {
  jest.useRealTimers();
  jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
};

export const buildPayload = (sizeBytes: number) => 'x'.repeat(sizeBytes);

const flushReleases = () => new Promise((resolve) => setImmediate(resolve));

export type MemoryHarnessOptions = {
  isEnabled?: boolean;
  maxMemoryBytes?: number;
  otherDataBytes?: number;
  workspaceShare?: number;
  applicationShare?: number;
  reserve?: number;
  maxJobSizeBytes?: number;
};

// used_memory follows the charged bytes, as jobs are what fills Redis in these scenarios
export const createMemoryHarness = async ({
  isEnabled = true,
  maxMemoryBytes = 100_000,
  otherDataBytes = 0,
  workspaceShare = 0.1,
  applicationShare = 0.4,
  reserve = 0.1,
  maxJobSizeBytes = 1_048_576,
}: MemoryHarnessOptions = {}) => {
  const redis: Redis = new RedisMock();

  await redis.flushall();

  const state = { otherDataBytes, isRedisBroken: false };

  const readUsedBytes = async (groupKey: string) =>
    Number((await redis.get(`${USED_KEY_PREFIX}${groupKey}`)) ?? 0);

  // A job charged to its workspace and application keys is stored once in Redis
  const readTotalChargedBytes = async () => {
    const jobsKeys = await redis.keys(`${JOBS_KEY_PREFIX}*`);
    const chargedJobs = await Promise.all(
      jobsKeys.map((key) => redis.hgetall(key)),
    );
    const sizeByMember = new Map(
      chargedJobs.flatMap((jobs) => Object.entries(jobs)),
    );

    return [...sizeByMember.values()].reduce(
      (total, size) => total + Number(size),
      0,
    );
  };

  const client = {
    runCommand: async (name: string, args: (string | number)[]) => {
      if (name === 'info') {
        const usedMemoryBytes =
          state.otherDataBytes + (await readTotalChargedBytes());

        return `# Memory\r\nused_memory:${usedMemoryBytes}\r\nmaxmemory:${maxMemoryBytes}\r\n`;
      }

      if (state.isRedisBroken) {
        throw new Error('connection lost');
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

  mockBullMQ.reset({ redis, client });

  const configValues: Record<string, unknown> = {
    IS_REDIS_MEMORY_FAIRNESS_ENABLED: isEnabled,
    JOB_QUEUE_MAX_JOB_SIZE_BYTES: maxJobSizeBytes,
    JOB_QUEUE_MEMORY_SHARE_BY_WORKSPACE_ID: workspaceShare,
    JOB_QUEUE_MEMORY_SHARE_BY_APPLICATION_UNIVERSAL_IDENTIFIER:
      applicationShare,
    JOB_QUEUE_MEMORY_RESERVE: reserve,
  };
  const metricsService = {
    incrementCounterForEvent: jest.fn(),
    recordHistogram: jest.fn(),
    createMultiObservableGauge: jest.fn(),
  };
  const driver = new BullMQDriver(
    { prefix: KEY_PREFIX } as never,
    metricsService as never,
    { get: (key: string) => configValues[key] } as never,
    { emit: jest.fn() } as never,
  );

  driver.register(MEMORY_SCENARIO_QUEUE);

  let handleJob: (
    job: MessageQueueJob<MemoryScenarioJobData>,
  ) => Promise<void> = async () => undefined;

  driver.work<MemoryScenarioJobData>(MEMORY_SCENARIO_QUEUE, (job) =>
    handleJob(job),
  );

  const buildApplicationJob = ({
    label,
    workspaceId,
    applicationUniversalIdentifier = 'app-1',
    payloadBytes = 0,
    jobId,
  }: {
    label: string;
    workspaceId: string;
    applicationUniversalIdentifier?: string;
    payloadBytes?: number;
    jobId?: string;
  }): QueueJobToAdd<MemoryScenarioJobData> => ({
    data: { label, workspaceId, payload: buildPayload(payloadBytes) },
    workspaceId,
    applicationUniversalIdentifier,
    jobId,
  });

  const enqueueBulk = (
    jobs: QueueJobToAdd<MemoryScenarioJobData>[],
    settings?: QueueJobSettings,
  ) =>
    driver.bulkAdd(
      MEMORY_SCENARIO_QUEUE,
      MEMORY_SCENARIO_JOB_NAME,
      jobs,
      settings,
    );

  const enqueue = ({
    label,
    payloadBytes = 0,
    options,
  }: {
    label: string;
    payloadBytes?: number;
    options: QueueJobOptions;
  }) =>
    driver.add(
      MEMORY_SCENARIO_QUEUE,
      MEMORY_SCENARIO_JOB_NAME,
      {
        label,
        workspaceId: options.workspaceId,
        payload: buildPayload(payloadBytes),
      },
      options,
    );

  const emit = async ({
    event,
    job,
    error,
  }: {
    event: string;
    job: StoredJob;
    error?: Error;
  }) => {
    mockBullMQ.listeners
      .filter((listener) => listener.event === event)
      .forEach(({ listener }) => listener(job, error));
    await flushReleases();
  };

  const processJobOrThrow = async ({
    jobId,
    handler = async () => undefined,
  }: {
    jobId: string;
    handler?: (job: MessageQueueJob<MemoryScenarioJobData>) => Promise<void>;
  }) => {
    const job = mockBullMQ.jobs.get(jobId);

    if (!isDefined(job) || !isDefined(mockBullMQ.processor)) {
      throw new Error(`Job ${jobId} cannot be processed`);
    }

    mockBullMQ.waitingJobIds = mockBullMQ.waitingJobIds.filter(
      (waitingJobId) => waitingJobId !== jobId,
    );
    handleJob = handler;

    const updateData = async (data: MemoryScenarioJobData) => {
      job.data = data;
    };

    Object.assign(job, { updateData });

    try {
      await mockBullMQ.processor({ ...job, updateData, timestamp: Date.now() });
    } catch (error) {
      job.attemptsMade += 1;

      const isFinal =
        error instanceof UnrecoverableError ||
        job.attemptsMade >= (job.opts.attempts ?? 1);

      if (isFinal) {
        job.finishedOn = Date.now();
      } else {
        mockBullMQ.waitingJobIds.push(jobId);
      }

      await emit({ event: 'failed', job, error: error as Error });

      return;
    }

    job.attemptsMade += 1;
    job.finishedOn = Date.now();
    await emit({ event: 'completed', job });
  };

  const removeFromBullMQ = async (jobId: string) => {
    mockBullMQ.jobs.delete(jobId);
    mockBullMQ.waitingJobIds = mockBullMQ.waitingJobIds.filter(
      (waitingJobId) => waitingJobId !== jobId,
    );
    await redis.del(buildJobKey(jobId));
  };

  const readGaugeCallback = () => {
    const gauge = metricsService.createMultiObservableGauge.mock.calls.find(
      ([{ metricName }]) => metricName === 'twenty_queue_memory_used_ratio',
    );

    return gauge?.[0].callback as () => Promise<
      { value: number; attributes: Record<string, string> }[]
    >;
  };

  return {
    driver,
    redis,
    metricsService,
    buildApplicationJob,
    enqueue,
    enqueueBulk,
    processJobOrThrow,
    removeFromBullMQ,
    readUsedBytes,
    readTotalChargedBytes,
    readGaugeCallback,
    readChargedJobs: (groupKey: string) =>
      redis.hgetall(`${JOBS_KEY_PREFIX}${groupKey}`),
    readTtl: (groupKey: string) => redis.ttl(`${USED_KEY_PREFIX}${groupKey}`),
    removeJob: (jobId: string) =>
      driver.removeJob(MEMORY_SCENARIO_QUEUE, jobId),
    lockJob: (jobId: string) => {
      mockBullMQ.lockedJobIds.add(jobId);
    },
    markFinished: async (jobId: string) => {
      await redis.hset(buildJobKey(jobId), 'finishedOn', Date.now());
    },
    onBeforeRemove: (beforeRemove: () => Promise<void>) => {
      mockBullMQ.beforeRemove = beforeRemove;
    },
    storedJobIds: () => [...mockBullMQ.jobs.keys()],
    storedJob: (jobId: string) => mockBullMQ.jobs.get(jobId),
    failNextAdd: (failure: AddFailure) => {
      mockBullMQ.nextAddFailure = failure;
      mockBullMQ.isGetJobBroken = failure === 'unknown-outcome';
    },
    breakRedis: () => {
      state.isRedisBroken = true;
    },
    setOtherDataBytes: (bytes: number) => {
      state.otherDataBytes = bytes;
    },
  };
};

export type MemoryHarness = Awaited<ReturnType<typeof createMemoryHarness>>;
