import { QUEUE_RETENTION } from 'src/engine/core-modules/message-queue/constants/queue-retention.constants';
import { SyncDriver } from 'src/engine/core-modules/message-queue/drivers/sync.driver';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

const QUEUE = MessageQueue.workspaceQueue;

describe('SyncDriver job snapshots', () => {
  it.each([50, { completed: 5, total: 10 }])(
    'retains progress %p and payload updates when work completes',
    async (progress) => {
      const driver = new SyncDriver();
      driver.work(QUEUE, async (job) => {
        expect((await driver.getJobs(QUEUE, [job.id]))[job.id]).toMatchObject({
          state: 'active',
          progress: 0,
        });
        await job.updateData({ cursor: 'next-page' });
        await job.updateProgress(progress);
        expect((await driver.getJobs(QUEUE, [job.id]))[job.id]).toMatchObject({
          state: 'active',
          data: { cursor: 'next-page' },
          progress,
        });
      });
      const [id] = await driver.bulkAdd(QUEUE, 'job', [{ data: {} }]);

      expect((await driver.getJobs(QUEUE, [id]))[id]).toMatchObject({
        state: 'completed',
        data: { cursor: 'next-page' },
        progress,
        attemptsMade: 1,
        finishedOn: expect.any(Number),
      });
      expect(await driver.getJobs(MessageQueue.emailQueue, [id])).toEqual({});
      expect(await driver.getJobs(QUEUE, ['missing-job'])).toEqual({});
    },
  );

  it('retains failed progress and still processes the remaining bulk jobs', async () => {
    const driver = new SyncDriver();
    const error = new Error('Storage failed');
    driver.work(QUEUE, async (job) => {
      await job.updateProgress(50);
      if (job.id === 'failed-job') {
        throw error;
      }
      await job.updateProgress(100);
    });

    await expect(
      driver.bulkAdd(QUEUE, 'job', [
        { jobId: 'failed-job', data: {} },
        { jobId: 'completed-job', data: {} },
      ]),
    ).rejects.toBe(error);
    const jobs = await driver.getJobs(QUEUE, ['failed-job', 'completed-job']);

    expect(jobs['failed-job']).toMatchObject({
      state: 'failed',
      progress: 50,
      failedReason: 'Storage failed',
      attemptsMade: 1,
      finishedOn: expect.any(Number),
    });
    expect(jobs['completed-job']).toMatchObject({
      state: 'completed',
      progress: 100,
    });
  });

  it('bounds retained snapshots without evicting an active job', async () => {
    const driver = new SyncDriver();
    let finishActiveJob = () => {};
    const activeJob = new Promise<void>((resolve) => {
      finishActiveJob = resolve;
    });
    driver.work(QUEUE, async (job) => {
      if (job.id === 'active-job') {
        await job.updateProgress(25);
        await activeJob;
      }
    });
    const pendingAdd = driver.bulkAdd(QUEUE, 'job', [
      { jobId: 'active-job', data: {} },
    ]);
    const jobs = Array.from(
      { length: QUEUE_RETENTION.completedMaxCount + 1 },
      (_, index) => ({
        jobId: `job-${index}`,
        data: {},
      }),
    );
    const ids = await driver.bulkAdd(QUEUE, 'job', jobs);
    const snapshots = await driver.getJobs(QUEUE, ['active-job', ...ids]);

    expect(Object.keys(snapshots)).toHaveLength(
      QUEUE_RETENTION.completedMaxCount,
    );
    expect(snapshots[ids[0]]).toBeUndefined();
    expect(snapshots[ids[ids.length - 1]]?.state).toBe('completed');
    expect(snapshots['active-job']).toMatchObject({
      state: 'active',
      progress: 25,
    });

    finishActiveJob();
    await pendingAdd;
  });

  it('prunes old snapshots when another job finishes', async () => {
    const driver = new SyncDriver();
    driver.work(QUEUE, async () => {});
    const [oldId] = await driver.bulkAdd(QUEUE, 'job', [{ data: {} }]);
    jest.setSystemTime(Date.now() + QUEUE_RETENTION.completedMaxAge * 1000 + 1);
    const [newId] = await driver.bulkAdd(QUEUE, 'job', [{ data: {} }]);
    const jobs = await driver.getJobs(QUEUE, [oldId, newId]);

    expect(jobs[oldId]).toBeUndefined();
    expect(jobs[newId]?.state).toBe('completed');
  });
});
