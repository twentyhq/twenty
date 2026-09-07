import { BullMQDriver } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

const mockGetJobs = jest.fn();
const mockAdd = jest.fn();
const mockAddBulk = jest.fn();

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    getJobs: mockGetJobs,
    add: mockAdd,
    addBulk: mockAddBulk,
  })),
  Worker: jest.fn(),
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
