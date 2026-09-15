import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { DeleteRecordExportJob } from 'src/engine/core-modules/record-export/jobs/delete-record-export.job';
import { getRecordExportMock } from 'src/engine/core-modules/record-export/mocks/record-export.mock';
import { RecordExportCacheService } from 'src/engine/core-modules/record-export/services/record-export-cache.service';
import { RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';

describe('DeleteRecordExportJob', () => {
  const cache = { findOne: jest.fn() };
  const queue = { add: jest.fn() };
  const storage = { deleteFolderObjects: jest.fn() };
  const service = {
    getFileResource: (workspaceId: string, resourcePath: string) => ({
      workspaceId,
      resourcePath,
    }),
  };
  const job = new DeleteRecordExportJob(
    cache as unknown as RecordExportCacheService,
    queue as unknown as MessageQueueService,
    service as unknown as RecordExportWorkspaceService,
    storage as unknown as FileStorageService,
  );
  beforeEach(() => jest.resetAllMocks());

  it('deletes the file folder after the Redis entry expires', async () => {
    await job.handle({ workspaceId: 'workspace', recordExportId: 'export' });
    expect(storage.deleteFolderObjects).toHaveBeenCalledWith({
      workspaceId: 'workspace',
      resourcePath: 'export',
      folderPath: 'export',
    });
    expect(queue.add).not.toHaveBeenCalled();
  });

  it('defers deletion while the export or download is still available', async () => {
    cache.findOne.mockResolvedValue(getRecordExportMock());
    queue.add.mockResolvedValue('cleanup');
    await job.handle({ workspaceId: 'workspace', recordExportId: 'export' });
    expect(storage.deleteFolderObjects).not.toHaveBeenCalled();
    expect(queue.add).toHaveBeenCalledWith(
      DeleteRecordExportJob.name,
      { workspaceId: 'workspace', recordExportId: 'export' },
      expect.objectContaining({ delay: 30_000, allowDuplicatedPrefixes: true }),
    );
  });

  it('allows the queue to retry failed file deletion', async () => {
    storage.deleteFolderObjects.mockRejectedValue(
      new Error('Storage unavailable'),
    );
    await expect(
      job.handle({ workspaceId: 'workspace', recordExportId: 'export' }),
    ).rejects.toThrow('Storage unavailable');
  });
});
