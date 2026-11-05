import { type Job, Worker } from 'bullmq';
import { type Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';

import { BullMQDriver } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

const QUEUE = MessageQueue.logicFunctionQueue;
const KEY_PREFIX = 'bull';
const MAX_MEMORY_BYTES = 1_000_000;

const mockQueueClient: { current?: unknown } = {};
const mockAdd = jest.fn();
const mockAddBulk = jest.fn();
const mockGetJob = jest.fn();

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    get client() {
      return Promise.resolve(mockQueueClient.current);
    },
    toKey: (jobId: string) => `bull:logic-function-queue:${jobId}`,
    add: mockAdd,
    addBulk: mockAddBulk,
    getJob: mockGetJob,
    getRanges: jest.fn().mockResolvedValue([]),
    setGlobalConcurrency: jest.fn(),
    removeGlobalConcurrency: jest.fn(),
  })),
  Worker: jest.fn().mockImplementation(() => ({ on: jest.fn() })),
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

const buildApplicationJob = (workspaceId: string, payload = 'x') => ({
  data: { workspaceId, payload },
  workspaceId,
  applicationUniversalIdentifier: 'app-1',
});

const createDriver = async (mode: string) => {
  const redis: Redis = new RedisMock();

  await redis.flushall();

  mockQueueClient.current = {
    runCommand: async (name: string, args: (string | number)[]) => {
      if (name === 'info') {
        return `used_memory:0\r\nmaxmemory:${MAX_MEMORY_BYTES}\r\n`;
      }

      const [script, numberOfKeys, ...scriptArguments] = args;

      return name === 'evalsha'
        ? redis.evalsha(
            String(script),
            Number(numberOfKeys),
            ...scriptArguments,
          )
        : redis.eval(String(script), Number(numberOfKeys), ...scriptArguments);
    },
  };

  const configValues: Record<string, unknown> = {
    JOB_QUEUE_MEMORY_LIMIT_MODE: mode,
    JOB_QUEUE_MAX_JOB_SIZE_BYTES: 1_048_576,
    JOB_QUEUE_MEMORY_SHARE: 0.1,
    JOB_QUEUE_MEMORY_RESERVE: 0,
  };
  const driver = new BullMQDriver(
    { prefix: KEY_PREFIX } as never,
    {
      incrementCounterForEvent: jest.fn(),
      recordHistogram: jest.fn(),
    } as never,
    { get: (key: string) => configValues[key] } as never,
    {} as never,
  );

  driver.register(QUEUE);

  const readUsedBytes = async (groupKey: string) =>
    Number((await redis.get(`${KEY_PREFIX}:jobmem:used:${groupKey}`)) ?? 0);

  return { driver, redis, readUsedBytes };
};

describe('BullMQDriver job memory', () => {
  beforeAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockAddBulk.mockImplementation(
      async (jobs: { opts: { jobId?: string } }[]) =>
        jobs.map(({ opts }) => ({ id: opts.jobId })),
    );
    mockAdd.mockImplementation(
      async (_name: string, _data: unknown, opts: { jobId?: string }) => ({
        id: opts.jobId,
      }),
    );
  });

  it('reports job sizes and the memory still available', async () => {
    const { driver, readUsedBytes } = await createDriver('observe');

    const report = await driver.bulkAddWithReport(QUEUE, 'job', [
      buildApplicationJob('ws-1'),
      buildApplicationJob('ws-1'),
    ]);

    expect(report.jobs).toHaveLength(2);
    report.jobs.forEach(({ sizeBytes }) =>
      expect(sizeBytes).toBeGreaterThan(1024),
    );

    const usedBytes = await readUsedBytes('workspace:ws-1');
    const [addedJob] = mockAddBulk.mock.calls[0][0];

    expect(usedBytes).toBe(
      report.jobs.reduce((total, { sizeBytes }) => total + sizeBytes, 0),
    );
    expect(report.availableBytes).toBe(MAX_MEMORY_BYTES * 0.1 - usedBytes);
    expect(addedJob.opts).toMatchObject({
      memoryGroupKeys: ['workspace:ws-1', 'application:app-1'],
      memorySizeBytes: report.jobs[0].sizeBytes,
    });
  });

  it('returns a null availability and charges nothing when off', async () => {
    const { driver, readUsedBytes } = await createDriver('off');

    const report = await driver.bulkAddWithReport(QUEUE, 'job', [
      { ...buildApplicationJob('ws-1'), jobId: 'job-1' },
    ]);

    expect(report.availableBytes).toBeNull();
    expect(await readUsedBytes('workspace:ws-1')).toBe(0);
  });

  it('does not charge a job id that BullMQ still holds', async () => {
    const { driver, redis, readUsedBytes } = await createDriver('observe');

    await redis.hset(`${KEY_PREFIX}:${QUEUE}:finished-job`, 'name', 'job');

    const report = await driver.bulkAddWithReport(QUEUE, 'job', [
      { ...buildApplicationJob('ws-1'), jobId: 'finished-job' },
      { ...buildApplicationJob('ws-1'), jobId: 'new-job' },
    ]);

    const [finishedJob, newJob] = mockAddBulk.mock.calls[0][0];

    expect(finishedJob.opts.memoryGroupKeys).toBeUndefined();
    expect(newJob.opts.memoryGroupKeys).toEqual([
      'workspace:ws-1',
      'application:app-1',
    ]);
    expect(await readUsedBytes('workspace:ws-1')).toBe(
      report.jobs[1].sizeBytes,
    );
  });

  it('releases the charge of a job deduplicated into another one', async () => {
    const { driver, readUsedBytes } = await createDriver('observe');

    mockAdd.mockResolvedValue({ id: 'existing-job' });

    await driver.add(
      QUEUE,
      'job',
      { workspaceId: 'ws-1' },
      {
        workspaceId: 'ws-1',
        isWorkspaceJob: true,
        deduplication: { id: 'dedup-1' },
      },
    );

    expect(await readUsedBytes('workspace:ws-1')).toBe(0);
  });

  it('releases the charges of jobs that were not added when the add fails', async () => {
    const { driver, readUsedBytes } = await createDriver('observe');

    mockAddBulk.mockRejectedValue(new Error('connection lost'));
    mockGetJob.mockResolvedValue(undefined);

    await expect(
      driver.bulkAdd(QUEUE, 'job', [buildApplicationJob('ws-1')]),
    ).rejects.toThrow('connection lost');
    expect(await readUsedBytes('workspace:ws-1')).toBe(0);
  });

  it('keeps the charge when the outcome of a failed add is unknown', async () => {
    const { driver, readUsedBytes } = await createDriver('observe');

    mockAddBulk.mockRejectedValue(new Error('connection lost'));
    mockGetJob.mockRejectedValue(new Error('connection lost'));

    await expect(
      driver.bulkAdd(QUEUE, 'job', [buildApplicationJob('ws-1')]),
    ).rejects.toThrow('connection lost');
    expect(await readUsedBytes('workspace:ws-1')).toBeGreaterThan(0);
  });

  it('follows payload updates and releases on completion or final failure only', async () => {
    const { driver, readUsedBytes } = await createDriver('observe');

    await driver.bulkAdd(QUEUE, 'job', [buildApplicationJob('ws-1')]);

    const [{ opts }] = mockAddBulk.mock.calls[0][0];
    const initialUsedBytes = await readUsedBytes('workspace:ws-1');
    const job = {
      id: opts.jobId,
      name: 'job',
      data: { workspaceId: 'ws-1' },
      opts,
      timestamp: Date.now(),
      updateData: jest.fn(),
    } as unknown as Job;

    driver.work(QUEUE, async (queueJob) => {
      await queueJob.updateData({
        workspaceId: 'ws-1',
        payload: 'y'.repeat(1_000),
      });
    });

    const worker = jest.mocked(Worker).mock.results[0].value as {
      on: jest.Mock;
    };
    const processor = jest.mocked(Worker).mock.calls[0][1];

    if (typeof processor !== 'function') {
      throw new Error('Worker processor was not registered');
    }

    await processor(job);

    expect(await readUsedBytes('workspace:ws-1')).toBeGreaterThan(
      initialUsedBytes + 900,
    );

    const emit = async (event: string, emittedJob: Job) => {
      worker.on.mock.calls
        .filter(([eventName]) => eventName === event)
        .forEach(([, listener]) => listener(emittedJob, new Error('failed')));
      await new Promise((resolve) => setImmediate(resolve));
    };

    await emit('failed', job);

    expect(await readUsedBytes('workspace:ws-1')).toBeGreaterThan(0);

    await emit('failed', { ...job, finishedOn: Date.now() } as Job);

    expect(await readUsedBytes('workspace:ws-1')).toBe(0);
  });
});
