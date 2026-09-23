import { type Job, Worker } from 'bullmq';

import { QUEUE_JOB_CHANGED_EVENT } from 'src/engine/core-modules/message-queue/constants/queue-job-changed-event.constant';
import { BullMQDriver } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

const mockGetJobs = jest.fn();
const mockGetJob = jest.fn();
const mockAdd = jest.fn();
const mockAddBulk = jest.fn();
const mockSetGlobalConcurrency = jest.fn();
const mockRemoveGlobalConcurrency = jest.fn();
const mockGetJobCountByTypes = jest.fn();

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    getJobs: mockGetJobs,
    getJob: mockGetJob,
    add: mockAdd,
    addBulk: mockAddBulk,
    setGlobalConcurrency: mockSetGlobalConcurrency,
    removeGlobalConcurrency: mockRemoveGlobalConcurrency,
    getJobCountByTypes: mockGetJobCountByTypes,
  })),
  Worker: jest.fn().mockImplementation(() => ({ on: jest.fn() })),
  MetricsTime: { ONE_WEEK: 1 },
}));

jest.mock('uuid', () => ({ v4: () => 'generated-uuid-000000000000000000000' }));

const WAITING_JOB_ID = 'sync-catalog-ws-1-5c98b035-5b09-4550-a4fb-b52056c494d1';

describe('BullMQDriver deduplication', () => {
  const driver = new BullMQDriver(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

  driver.register(MessageQueue.workspaceQueue);

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetJobs.mockResolvedValue([{ id: WAITING_JOB_ID }]);
    mockAdd.mockImplementation(async (_name, _data, opts) => ({
      id: opts.jobId,
    }));
    mockAddBulk.mockImplementation(async (jobs) =>
      jobs.map((job: { opts: { jobId?: string } }, index: number) => ({
        id: job.opts.jobId ?? `auto-${index}`,
      })),
    );
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

      expect(mockGetJobs).not.toHaveBeenCalled();
      expect(mockAddBulk).toHaveBeenCalledTimes(1);
      expect(mockAddBulk.mock.calls[0][0]).toHaveLength(2);
    });

    it('reads the waiting jobs once and drops the jobs already waiting', async () => {
      mockGetJobs.mockResolvedValue([
        { id: WAITING_JOB_ID },
        { id: 'ws-1.exact-job-id' },
      ]);

      const jobIds = await driver.bulkAdd(MessageQueue.workspaceQueue, 'job', [
        { data: {}, jobId: 'ws-1.exact-job-id' },
        { data: {}, jobId: 'sync-catalog-ws-1' },
        { data: {}, jobId: 'ws-1.new-job-id' },
        { data: {} },
      ]);

      expect(mockGetJobs).toHaveBeenCalledTimes(1);
      expect(mockGetJobs).toHaveBeenCalledWith(['waiting', 'prioritized']);
      expect(
        mockAddBulk.mock.calls[0][0].map(
          (job: { opts: { jobId?: string } }) => job.opts.jobId,
        ),
      ).toEqual(['ws-1.new-job-id', undefined]);
      expect(jobIds).toEqual(['ws-1.new-job-id', 'auto-1']);
    });

    it('adds nothing when every job is already waiting', async () => {
      mockGetJobs.mockResolvedValue([{ id: 'ws-1.exact-job-id' }]);

      const jobIds = await driver.bulkAdd(MessageQueue.workspaceQueue, 'job', [
        { data: {}, jobId: 'ws-1.exact-job-id' },
      ]);

      expect(jobIds).toEqual([]);
      expect(mockAddBulk).not.toHaveBeenCalled();
    });

    it('skips the deduplication when duplicated prefixes are allowed', async () => {
      await driver.bulkAdd(
        MessageQueue.workspaceQueue,
        'job',
        [{ data: {}, jobId: 'ws-1.exact-job-id' }],
        { allowDuplicatedPrefixes: true },
      );

      expect(mockGetJobs).not.toHaveBeenCalled();
      expect(mockAddBulk).toHaveBeenCalledTimes(1);
    });
  });
});

describe('BullMQDriver progress', () => {
  const driver = new BullMQDriver(
    {} as never,
    { recordHistogram: jest.fn() } as never,
    {} as never,
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

      const firstCall = jest.mocked(Worker).mock.calls[0];

      jestExpectToBeDefined(firstCall);

      const processor = firstCall[1];

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
    {} as never,
    eventEmitter as never,
  );

  driver.register(MessageQueue.workspaceQueue);

  const getWorkerListener = (eventName: string) => {
    driver.work(MessageQueue.workspaceQueue, async () => {});

    const workerInstances = jest.mocked(Worker).mock.results;
    const worker = workerInstances[workerInstances.length - 1]
      ?.value as unknown as { on: jest.Mock };
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
    {} as never,
    {} as never,
  );

  driver.register(MessageQueue.workflowQueue);

  const processJob = async (
    job: Pick<Job, 'opts' | 'timestamp' | 'attemptsStarted'>,
  ) => {
    jest.clearAllMocks();
    driver.work(MessageQueue.workflowQueue, jest.fn());

    const processor = jest.mocked(Worker).mock.calls[0]?.[1];

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
      expect.objectContaining({ value: 0 }),
    );
  });

  it('does not sample the wait of a re-run after a retry or a stall', async () => {
    await processJob({
      opts: {},
      timestamp: Date.now() - 120_000,
      attemptsStarted: 2,
    });

    expect(recordHistogram).not.toHaveBeenCalled();
  });
});

describe('BullMQDriver queue job count gauges', () => {
  const createMultiObservableGauge = jest.fn();
  const driver = new BullMQDriver(
    {} as never,
    { createMultiObservableGauge } as never,
    {} as never,
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
    {} as never,
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
