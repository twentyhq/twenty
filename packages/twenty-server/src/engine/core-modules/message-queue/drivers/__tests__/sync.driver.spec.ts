import { SyncDriver } from 'src/engine/core-modules/message-queue/drivers/sync.driver';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

describe('SyncDriver job snapshots', () => {
  it('retains progress and the handler result when work completes', async () => {
    const driver = new SyncDriver();
    driver.work(MessageQueue.recordExportQueue, async (job) => {
      await job.updateData({ cursor: 'next-page' });
      await job.updateProgress({ processedRecordCount: 100 });
      const active = await driver.getJobs(MessageQueue.recordExportQueue, [
        job.id,
      ]);
      expect(active[job.id]).toMatchObject({
        state: 'active',
        data: { cursor: 'next-page' },
        progress: { processedRecordCount: 100 },
      });
      return { fileId: 'file-id' };
    });
    const id = (await driver.add(
      MessageQueue.recordExportQueue,
      'Export',
      {},
    ))!;
    const jobs = await driver.getJobs(MessageQueue.recordExportQueue, [id]);
    expect(jobs[id]).toMatchObject({
      state: 'completed',
      result: { fileId: 'file-id' },
      progress: { processedRecordCount: 100 },
    });
    expect(await driver.getJobs(MessageQueue.workspaceQueue, [id])).toEqual({
      [id]: undefined,
    });
  });

  it('keeps failures observable while preserving synchronous error propagation', async () => {
    const driver = new SyncDriver();
    let id = '';
    driver.work(MessageQueue.recordExportQueue, async (job) => {
      id = job.id;
      throw new Error('Storage failed');
    });
    await expect(
      driver.add(MessageQueue.recordExportQueue, 'Export', {}),
    ).rejects.toThrow('Storage failed');
    const jobs = await driver.getJobs(MessageQueue.recordExportQueue, [id]);
    expect(jobs[id]).toMatchObject({
      state: 'failed',
      failedReason: 'Storage failed',
    });
    expect(jobs[id]?.result).toBeUndefined();
  });
});
