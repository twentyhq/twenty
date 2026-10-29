import { type Job, Worker } from 'bullmq';

import { DEFAULT_JOB_PRIORITY } from 'src/engine/core-modules/message-queue/constants/default-job-priority.constant';
import { QUEUE_JOB_CHANGED_EVENT } from 'src/engine/core-modules/message-queue/constants/queue-job-changed-event.constant';
import { BullMQDriver } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import {
  FAIR_REBASE_STEP,
  FAIR_TICKET_OFFSET,
  URGENT_FAIR_PRIORITY,
} from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { JOB_LATENCY_MS_BUCKET_BOUNDARIES } from 'src/engine/core-modules/metrics/constants/job-latency-ms-bucket-boundaries.constant';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

const mockGetJobs = jest.fn();
const mockGetRanges = jest.fn();
const mockGetJob = jest.fn();
const mockAdd = jest.fn();
const mockAddBulk = jest.fn();
const mockSetGlobalConcurrency = jest.fn();
const mockRemoveGlobalConcurrency = jest.fn();
const mockGetJobCountByTypes = jest.fn();
const mockTwentyConfigService = { get: jest.fn().mockReturnValue(false) };
const mockAllocateTickets = jest.fn();
const mockRecordDispatch = jest.fn();

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    getJobs: mockGetJobs,
    getRanges: mockGetRanges,
    getJob: mockGetJob,
    add: mockAdd,
    addBulk: mockAddBulk,
    setGlobalConcurrency: mockSetGlobalConcurrency,
    removeGlobalConcurrency: mockRemoveGlobalConcurrency,
    getJobCountByTypes: mockGetJobCountByTypes,
  })),
  Worker: jest.fn().mockImplementation(() => ({ on: jest.fn() })),
  MetricsTime: { ONE_WEEK: 1 },
  PRIORITY_LIMIT: jest.requireActual('bullmq').PRIORITY_LIMIT,
}));

jest.mock('uuid', () => ({ v4: () => 'generated-uuid-000000000000000000000' }));

jest.mock(
  'src/engine/core-modules/message-queue/drivers/fairness/fair-ticket-allocator',
  () => ({
    FairTicketAllocator: jest.fn().mockImplementation(() => ({
      allocateTickets: mockAllocateTickets,
      recordDispatch: mockRecordDispatch,
    })),
  }),
);

const WAITING_JOB_ID = 'sync-catalog-ws-1-5c98b035-5b09-4550-a4fb-b52056c494d1';

describe('BullMQDriver deduplication', () => {
  const driver = new BullMQDriver(
    {} as never,
    {} as never,
    mockTwentyConfigService as never,
    {} as never,
  );

  driver.register(MessageQueue.workspaceQueue);

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRanges.mockResolvedValue([WAITING_JOB_ID]);
    mockAdd.mockImplementation(async (_name, _data, opts) => ({
      id: opts.jobId,
    }));
    mockAddBulk.mockImplementation(async (jobs) =>
      jobs.map((job: { opts: { jobId?: string } }, index: number) => ({
        id: job.opts.jobId ?? `auto-${index}`,
      })),
    );
  });

  describe.each([undefined, 0, 2])('job priority %s', (priority) => {
    it('uses the caller priority or the shared default to add', async () => {
      await driver.add(MessageQueue.workspaceQueue, 'job', {}, { priority });

      expect(mockAdd).toHaveBeenCalledWith(
        'job',
        {},
        expect.objectContaining({ priority: priority ?? DEFAULT_JOB_PRIORITY }),
      );
    });

    it('uses the caller priority or the shared default to bulkAdd', async () => {
      await driver.bulkAdd(MessageQueue.workspaceQueue, 'job', [{ data: {} }], {
        priority,
      });

      expect(mockAddBulk).toHaveBeenCalledWith([
        expect.objectContaining({
          opts: expect.objectContaining({
            priority: priority ?? DEFAULT_JOB_PRIORITY,
          }),
        }),
      ]);
    });
  });

  describe('add', () => {
    it('skips a job whose id prefix is already waiting', async () => {
      const jobId = await driver.add(
        MessageQueue.workspaceQueue,
        'job',
        {},
        { id: 'sync-catalog-ws-1' },
      );

      expect(jobId).toBeUndefined();
      expect(mockAdd).not.toHaveBeenCalled();
    });

    it('suffixes the id so a finished job never blocks the next one', async () => {
      const jobId = await driver.add(
        MessageQueue.workspaceQueue,
        'job',
        {},
        { id: 'install-application-ws-1-app-1' },
      );

      expect(jobId).toBe(
        'install-application-ws-1-app-1-generated-uuid-000000000000000000000',
      );
    });
  });

  describe('bulkAdd', () => {
    it('does not read the waiting jobs when no job carries an id', async () => {
      await driver.bulkAdd(MessageQueue.workspaceQueue, 'job', [
        { data: {} },
        { data: {} },
      ]);

      expect(mockGetRanges).not.toHaveBeenCalled();
      expect(mockAddBulk).toHaveBeenCalledTimes(1);
      expect(mockAddBulk.mock.calls[0][0]).toHaveLength(2);
    });

    it('reads the waiting jobs once and drops the jobs already waiting', async () => {
      mockGetRanges.mockResolvedValue([WAITING_JOB_ID, 'ws-1.exact-job-id']);

      const jobIds = await driver.bulkAdd(MessageQueue.workspaceQueue, 'job', [
        { data: {}, jobId: 'ws-1.exact-job-id' },
        { data: {}, jobId: 'sync-catalog-ws-1' },
        { data: {}, jobId: 'ws-1.new-job-id' },
        { data: {} },
      ]);

      expect(mockGetRanges).toHaveBeenCalledTimes(1);
      expect(mockGetRanges).toHaveBeenCalledWith(
        ['waiting', 'paused', 'prioritized'],
        0,
        -1,
      );
      expect(mockGetJobs).not.toHaveBeenCalled();
      expect(
        mockAddBulk.mock.calls[0][0].map(
          (job: { opts: { jobId?: string } }) => job.opts.jobId,
        ),
      ).toEqual(['ws-1.new-job-id', undefined]);
      expect(jobIds).toEqual(['ws-1.new-job-id', 'auto-1']);
    });

    it('adds nothing when every job is already waiting', async () => {
      mockGetRanges.mockResolvedValue(['ws-1.exact-job-id']);

      const jobIds = await driver.bulkAdd(MessageQueue.workspaceQueue, 'job', [
        { data: {}, jobId: 'ws-1.exact-job-id' },
      ]);

      expect(jobIds).toEqual([]);
      expect(mockAddBulk).not.toHaveBeenCalled();
    });

    it('skips the deduplication when told not to check duplicates based on prefix', async () => {
      await driver.bulkAdd(
        MessageQueue.workspaceQueue,
        'job',
        [{ data: {}, jobId: 'ws-1.exact-job-id' }],
        { doNotCheckDuplicatesBasedOnPrefix: true },
      );

      expect(mockGetRanges).not.toHaveBeenCalled();
      expect(mockAddBulk).toHaveBeenCalledTimes(1);
    });
  });
});

describe('BullMQDriver progress', () => {
  const driver = new BullMQDriver(
    {} as never,
    { recordHistogram: jest.fn() } as never,
    mockTwentyConfigService as never,
    {} as never,
  );

  driver.register(MessageQueue.workspaceQueue);

  it.each([0, 50, { completed: 5, total: 10 }])(
    'persists progress %p through BullMQ and exposes it in job snapshots',
    async (progress) => {
      const job: Pick<
        Job,
        | 'id'
        | 'name'
        | 'data'
        | 'opts'
        | 'timestamp'
        | 'progress'
        | 'updateProgress'
        | 'getState'
      > = {
        id: 'job-id',
        name: 'job',
        data: {},
        opts: {},
        timestamp: Date.now(),
        progress: 0,
        async updateProgress(updatedProgress: Job['progress']) {
          this.progress = updatedProgress;
        },
        getState: jest.fn().mockResolvedValue('active'),
      };
      const updateProgress = jest.spyOn(job, 'updateProgress');
      mockGetJob.mockResolvedValue(job);
      driver.work(MessageQueue.workspaceQueue, async (queueJob) => {
        await queueJob.updateProgress(progress);
      });

      const processor = jest.mocked(Worker).mock.calls[0][1];

      if (typeof processor !== 'function') {
        throw new Error('Worker processor was not registered');
      }

      await processor(job as Job);

      expect(updateProgress).toHaveBeenCalledWith(progress);
      const jobs = await driver.getJobs(MessageQueue.workspaceQueue, [
        'job-id',
      ]);

      expect(jobs['job-id']).toMatchObject({ state: 'active', progress });
    },
  );
});

describe('BullMQDriver job change events', () => {
  const eventEmitter = { emit: jest.fn() };
  const driver = new BullMQDriver(
    {} as never,
    { recordHistogram: jest.fn() } as never,
    mockTwentyConfigService as never,
    eventEmitter as never,
  );

  driver.register(MessageQueue.workspaceQueue);

  const getWorkerListener = (eventName: string) => {
    driver.work(MessageQueue.workspaceQueue, async () => {});

    const workerInstances = jest.mocked(Worker).mock.results;
    const worker = workerInstances[workerInstances.length - 1]
      .value as unknown as { on: jest.Mock };
    const listener = worker.on.mock.calls.find(
      ([name]: [string, unknown]) => name === eventName,
    )?.[1];

    if (typeof listener !== 'function') {
      throw new Error(`No ${eventName} listener registered on the worker`);
    }

    return listener;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('forwards a progress update of a broadcast job as an active job change', () => {
    const onProgress = getWorkerListener('progress');

    onProgress(
      {
        id: 'job-id',
        data: {},
        opts: { broadcastTo: { workspaceId: 'workspace-id' } },
        attemptsMade: 0,
        progress: 40,
        timestamp: 1,
      } as unknown as Job,
      40,
    );

    expect(eventEmitter.emit).toHaveBeenCalledWith(QUEUE_JOB_CHANGED_EVENT, {
      queueName: MessageQueue.workspaceQueue,
      job: expect.objectContaining({
        id: 'job-id',
        state: 'active',
        progress: 40,
        broadcastTo: { workspaceId: 'workspace-id' },
      }),
    });
  });

  it('ignores progress updates of jobs without recipients', () => {
    const onProgress = getWorkerListener('progress');

    onProgress(
      {
        id: 'job-id',
        data: {},
        opts: {},
        attemptsMade: 0,
        progress: 40,
        timestamp: 1,
      } as unknown as Job,
      40,
    );

    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });
});

describe('BullMQDriver queue wait metric', () => {
  const recordHistogram = jest.fn();
  const driver = new BullMQDriver(
    {} as never,
    { recordHistogram } as never,
    mockTwentyConfigService as never,
    {} as never,
  );

  driver.register(MessageQueue.workflowQueue);

  const processJob = async (
    job: Pick<Job, 'opts' | 'timestamp' | 'attemptsStarted'>,
  ) => {
    jest.clearAllMocks();
    driver.work(MessageQueue.workflowQueue, jest.fn());

    const processor = jest.mocked(Worker).mock.calls[0][1];

    if (typeof processor !== 'function') {
      throw new Error('Worker processor was not registered');
    }

    await processor({
      id: 'job-id',
      name: 'job',
      data: {},
      updateData: jest.fn(),
      updateProgress: jest.fn(),
      ...job,
    } as unknown as Job);
  };

  beforeAll(() => {
    jest.setSystemTime(1_700_000_000_000);
  });

  it('records the wait net of the scheduled delay', async () => {
    await processJob({
      opts: { delay: 60_000 },
      timestamp: Date.now() - 62_000,
      attemptsStarted: 1,
    });

    expect(recordHistogram).toHaveBeenCalledWith(
      expect.objectContaining({
        key: MetricsKeys.JobLatencyMs,
        value: 2_000,
        attributes: { queue: MessageQueue.workflowQueue, job_name: 'job' },
      }),
    );
  });

  it('records no wait for a job picked up before its scheduled delay elapsed', async () => {
    await processJob({
      opts: { delay: 60_000 },
      timestamp: Date.now() - 30_000,
      attemptsStarted: 1,
    });

    expect(recordHistogram).toHaveBeenCalledWith(
      expect.objectContaining({ key: MetricsKeys.JobLatencyMs, value: 0 }),
    );
  });

  it('does not sample the wait of a re-run after a retry or a stall', async () => {
    await processJob({
      opts: {},
      timestamp: Date.now() - 120_000,
      attemptsStarted: 2,
    });

    expect(recordHistogram).not.toHaveBeenCalledWith(
      expect.objectContaining({ key: MetricsKeys.JobLatencyMs }),
    );
  });

  it('records the job duration', async () => {
    await processJob({
      opts: {},
      timestamp: Date.now(),
      attemptsStarted: 1,
    });

    const durationCalls = recordHistogram.mock.calls.filter(
      ([options]) => options.key === MetricsKeys.JobDurationMs,
    );

    expect(durationCalls).toHaveLength(1);
    expect(durationCalls[0][0]).toEqual({
      key: MetricsKeys.JobDurationMs,
      value: expect.any(Number),
      unit: 'ms',
      attributes: { queue: MessageQueue.workflowQueue, job_name: 'job' },
      bucketBoundaries: JOB_LATENCY_MS_BUCKET_BOUNDARIES,
    });
    expect(durationCalls[0][0].value).toBeGreaterThanOrEqual(0);
  });
});

describe('BullMQDriver queue job count gauges', () => {
  const createMultiObservableGauge = jest.fn();
  const driver = new BullMQDriver(
    {} as never,
    { createMultiObservableGauge } as never,
    mockTwentyConfigService as never,
    {} as never,
  );

  driver.register(MessageQueue.workflowQueue);

  const collectGauge = async (metricName: string) => {
    const gauge = createMultiObservableGauge.mock.calls
      .map(([options]) => options)
      .find((options) => options.metricName === metricName);

    if (!gauge) {
      throw new Error(`Gauge ${metricName} was not registered`);
    }

    return gauge.callback();
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetJobCountByTypes.mockImplementation(async (...types: string[]) =>
      types.includes('delayed') ? 7 : 3,
    );
    driver.onModuleInit();
  });

  it('reports the runnable backlog without the delayed jobs', async () => {
    await expect(
      collectGauge('twenty_queue_jobs_waiting_total'),
    ).resolves.toEqual([
      { value: 3, attributes: { queue: MessageQueue.workflowQueue } },
    ]);

    expect(mockGetJobCountByTypes).toHaveBeenCalledWith(
      'waiting',
      'prioritized',
      'paused',
      'waiting-children',
    );
  });

  it('reports the delayed jobs on their own gauge', async () => {
    await expect(
      collectGauge('twenty_queue_jobs_delayed_total'),
    ).resolves.toEqual([
      { value: 7, attributes: { queue: MessageQueue.workflowQueue } },
    ]);

    expect(mockGetJobCountByTypes).toHaveBeenCalledWith('delayed');
  });
});

describe('BullMQDriver global concurrency', () => {
  const driver = new BullMQDriver(
    {} as never,
    {} as never,
    mockTwentyConfigService as never,
    {} as never,
  );

  driver.register(MessageQueue.recordExportQueue);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets the global concurrency when the queue declares one', () => {
    driver.work(MessageQueue.recordExportQueue, jest.fn(), {
      globalConcurrency: 2,
    });

    expect(mockSetGlobalConcurrency).toHaveBeenCalledWith(2);
    expect(mockRemoveGlobalConcurrency).not.toHaveBeenCalled();
  });

  it('removes the global concurrency when the queue declares none', () => {
    driver.work(MessageQueue.recordExportQueue, jest.fn(), {});

    expect(mockRemoveGlobalConcurrency).toHaveBeenCalledTimes(1);
    expect(mockSetGlobalConcurrency).not.toHaveBeenCalled();
  });
});

describe('BullMQDriver fair tickets', () => {
  const incrementCounterForEvent = jest.fn();
  const driver = new BullMQDriver(
    {} as never,
    { incrementCounterForEvent } as never,
    {
      get: jest.fn((key: string) => key === 'IS_WORKER_FAIRNESS_ENABLED'),
    } as never,
    {} as never,
  );

  driver.register(MessageQueue.workspaceQueue);

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRanges.mockResolvedValue([]);
    mockAdd.mockImplementation(async (_name, _data, opts) => ({
      id: opts.jobId,
    }));
    mockAddBulk.mockImplementation(async (jobs) =>
      jobs.map((job: { opts: { jobId?: string } }, index: number) => ({
        id: job.opts.jobId ?? `auto-${index}`,
      })),
    );
  });

  it('ranks a job by the ticket of its workspace', async () => {
    mockAllocateTickets.mockResolvedValue({
      base: FAIR_REBASE_STEP,
      tickets: [{ tag: 7, weight: 1 }],
    });

    await driver.add(MessageQueue.workspaceQueue, 'job', {
      workspaceId: 'ws-1',
    });

    expect(mockAllocateTickets).toHaveBeenCalledWith({
      queueName: MessageQueue.workspaceQueue,
      requests: [{ groupKeys: ['workspace:ws-1'], jobCount: 1 }],
    });
    expect(mockAdd).toHaveBeenCalledWith(
      'job',
      { workspaceId: 'ws-1' },
      expect.objectContaining({
        priority: FAIR_TICKET_OFFSET + 7,
        fairBase: FAIR_REBASE_STEP,
      }),
    );
  });

  it('allocates one ticket per group of a bulk and spaces its jobs by the weight', async () => {
    mockAllocateTickets.mockResolvedValue({
      base: 0,
      tickets: [
        { tag: 10, weight: 0.5 },
        { tag: 0, weight: 1 },
      ],
    });

    await driver.bulkAdd(MessageQueue.workspaceQueue, 'job', [
      { data: { workspaceId: 'ws-1' } },
      { data: { workspaceId: 'ws-2' } },
      { data: { workspaceId: 'ws-1' } },
    ]);

    expect(mockAllocateTickets).toHaveBeenCalledWith({
      queueName: MessageQueue.workspaceQueue,
      requests: [
        { groupKeys: ['workspace:ws-1'], jobCount: 2 },
        { groupKeys: ['workspace:ws-2'], jobCount: 1 },
      ],
    });
    expect(
      mockAddBulk.mock.calls[0][0].map(
        ({ opts }: { opts: { priority: number } }) => opts.priority,
      ),
    ).toEqual([
      FAIR_TICKET_OFFSET + 10,
      FAIR_TICKET_OFFSET,
      FAIR_TICKET_OFFSET + 12,
    ]);
  });

  it('keeps priority 1 ahead of the fair tickets while still charging its group keys', async () => {
    mockAllocateTickets.mockResolvedValue({
      base: 0,
      tickets: [{ tag: 7, weight: 1 }],
    });

    await driver.add(
      MessageQueue.workspaceQueue,
      'job',
      { workspaceId: 'ws-1' },
      { priority: URGENT_FAIR_PRIORITY },
    );

    expect(mockAllocateTickets).toHaveBeenCalledTimes(1);
    expect(mockAdd).toHaveBeenCalledWith(
      'job',
      { workspaceId: 'ws-1' },
      expect.objectContaining({ priority: URGENT_FAIR_PRIORITY }),
    );
  });

  it('keeps the static priority and counts a fallback when no ticket comes back', async () => {
    mockAllocateTickets.mockResolvedValue(undefined);

    await driver.add(
      MessageQueue.workspaceQueue,
      'job',
      { workspaceId: 'ws-1' },
      { priority: 4 },
    );

    expect(mockAdd).toHaveBeenCalledWith(
      'job',
      { workspaceId: 'ws-1' },
      expect.objectContaining({ priority: 4 }),
    );
    expect(incrementCounterForEvent).toHaveBeenCalledWith(
      expect.objectContaining({ key: MetricsKeys.JobFairTagFallback }),
    );
  });

  it('leaves a delayed job on its static priority without charging a clock', async () => {
    await driver.add(
      MessageQueue.workspaceQueue,
      'job',
      { workspaceId: 'ws-1' },
      { delay: 1_000, priority: 4 },
    );

    expect(mockAllocateTickets).not.toHaveBeenCalled();
    expect(mockAdd).toHaveBeenCalledWith(
      'job',
      { workspaceId: 'ws-1' },
      expect.objectContaining({ delay: 1_000, priority: 4 }),
    );
  });
});

describe('BullMQDriver fair dispatch', () => {
  const processJob = async ({
    isFairnessEnabled,
  }: {
    isFairnessEnabled: boolean;
  }) => {
    const driver = new BullMQDriver(
      {} as never,
      { recordHistogram: jest.fn() } as never,
      {
        get: jest.fn(
          (key: string) =>
            key === 'IS_WORKER_FAIRNESS_ENABLED' && isFairnessEnabled,
        ),
      } as never,
      {} as never,
    );

    driver.register(MessageQueue.workflowQueue);
    jest.clearAllMocks();
    driver.work(MessageQueue.workflowQueue, jest.fn());

    const processor = jest.mocked(Worker).mock.calls[0][1];

    if (typeof processor !== 'function') {
      throw new Error('Worker processor was not registered');
    }

    await processor({
      id: 'job-id',
      name: 'job',
      data: {},
      opts: {},
      timestamp: Date.now(),
      attemptsStarted: 1,
      updateData: jest.fn(),
      updateProgress: jest.fn(),
    } as unknown as Job);
  };

  it('records the dispatch of a job when fairness is on', async () => {
    await processJob({ isFairnessEnabled: true });

    expect(mockRecordDispatch).toHaveBeenCalledWith({
      queueName: MessageQueue.workflowQueue,
      jobId: 'job-id',
    });
  });

  it('records nothing when fairness is off', async () => {
    await processJob({ isFairnessEnabled: false });

    expect(mockRecordDispatch).not.toHaveBeenCalled();
  });
});
