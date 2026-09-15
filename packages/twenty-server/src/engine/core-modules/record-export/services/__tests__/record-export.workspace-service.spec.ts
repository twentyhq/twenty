import { NotFoundException } from '@nestjs/common';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RecordExportStatus } from 'src/engine/core-modules/record-export/enums/record-export-status.enum';
import { getRecordExportMock } from 'src/engine/core-modules/record-export/mocks/record-export.mock';
import { RecordExportCacheService } from 'src/engine/core-modules/record-export/services/record-export-cache.service';
import { RecordExportQueryWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export-query.workspace-service';
import { RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';
import { type RecordExport } from 'src/engine/core-modules/record-export/types/record-export.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('RecordExportWorkspaceService', () => {
  const cache = {
    create: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };
  const queue = { add: jest.fn(), getJobs: jest.fn() };
  const cleanupQueue = { add: jest.fn() };
  const query = {
    assertCanExport: jest.fn(),
    buildContext: jest.fn(),
    readPage: jest.fn(),
  };
  const storage = { deleteFolderObjects: jest.fn() };
  const jwt = { signAsyncOrThrow: jest.fn() };
  const requester = {
    type: 'user',
    workspace: { id: 'workspace' },
    userWorkspaceId: 'owner',
    workspaceMemberId: 'member',
  } as UserWorkspaceAuthContext;
  const service = new RecordExportWorkspaceService(
    cache as unknown as RecordExportCacheService,
    queue as unknown as MessageQueueService,
    cleanupQueue as unknown as MessageQueueService,
    query as unknown as RecordExportQueryWorkspaceService,
    storage as unknown as FileStorageService,
    jwt as unknown as JwtWrapperService,
    { get: () => 'https://crm.example' } as unknown as TwentyConfigService,
  );
  let recordExport: RecordExport;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
    recordExport = getRecordExportMock();
    query.assertCanExport.mockResolvedValue(requester);
    query.buildContext.mockResolvedValue({
      queryRunnerContext: { flatObjectMetadata: { nameSingular: 'person' } },
    });
    cache.create.mockResolvedValue(recordExport);
    cache.findOne.mockImplementation(async () => ({ ...recordExport }));
    cache.update.mockImplementation(
      async (
        _workspaceId: string,
        _id: string,
        _condition: object,
        changes: object,
      ) => {
        Object.assign(recordExport, changes);
        return true;
      },
    );
    cache.delete.mockResolvedValue(undefined);
    storage.deleteFolderObjects.mockResolvedValue(undefined);
    queue.add.mockResolvedValue('job');
    cleanupQueue.add.mockResolvedValue('cleanup-job');
    queue.getJobs.mockResolvedValue({ job: { state: 'active' } });
    jwt.signAsyncOrThrow.mockResolvedValue('download-token');
  });

  it('schedules cleanup before the worker can create a file', async () => {
    await service.create(recordExport.parameters, requester);
    expect(cache.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userWorkspaceId: 'owner',
        parameters: recordExport.parameters,
      }),
    );
    expect(cleanupQueue.add.mock.invocationCallOrder[0]).toBeLessThan(
      queue.add.mock.invocationCallOrder[0],
    );
    expect(cleanupQueue.add).toHaveBeenCalledWith(
      'DeleteRecordExportJob',
      { workspaceId: 'workspace', recordExportId: 'export' },
      expect.objectContaining({ delay: 30_000, retryLimit: 10 }),
    );
  });

  it('does not generate a file when cleanup cannot be scheduled', async () => {
    cleanupQueue.add.mockRejectedValue(new Error('Queue unavailable'));
    await expect(
      service.create(recordExport.parameters, requester),
    ).rejects.toThrow('Queue unavailable');
    expect(queue.add).not.toHaveBeenCalled();
    expect(recordExport.status).toBe(RecordExportStatus.FAILED);
  });

  it('releases the active slot when generation cannot be queued', async () => {
    queue.add.mockRejectedValue(new Error('Queue unavailable'));
    await expect(
      service.create(recordExport.parameters, requester),
    ).rejects.toThrow('Queue unavailable');
    expect(recordExport.status).toBe(RecordExportStatus.FAILED);
  });

  it('deletes export state and files when the stream disconnects', async () => {
    const stream = await service.stream(recordExport.parameters, requester);
    expect((await stream.next()).value.status).toBe(RecordExportStatus.QUEUED);
    const pending = stream.next();
    await stream.return?.();
    expect((await pending).done).toBe(true);
    expect(cache.delete).toHaveBeenCalledWith('workspace', 'export');
    expect(storage.deleteFolderObjects).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'workspace',
        folderPath: 'export',
      }),
    );
  });

  it('cleans up a stream cancelled before its first event', async () => {
    const stream = await service.stream(recordExport.parameters, requester);
    await stream.return?.();
    expect(cache.delete).toHaveBeenCalledTimes(1);
  });

  it('sends the download URL and preserves the file for the download handoff', async () => {
    const stream = await service.stream(recordExport.parameters, requester);
    recordExport.status = RecordExportStatus.COMPLETED;
    recordExport.filePath = 'export/file.csv';
    const result = await stream.next();
    expect(result.value.downloadUrl).toBe(
      'https://crm.example/record-exports/export/download?token=download-token',
    );
    await stream.return?.();
    expect(cache.delete).not.toHaveBeenCalled();
    expect(storage.deleteFolderObjects).not.toHaveBeenCalled();
  });

  it('reports an interrupted worker as a failed export', async () => {
    recordExport.createdAt = new Date(Date.now() - 120_000);
    queue.getJobs.mockResolvedValue({});
    const stream = await service.stream(recordExport.parameters, requester);
    expect((await stream.next()).value.status).toBe(RecordExportStatus.FAILED);
    await stream.return?.();
  });

  it('does not issue download URLs to another requester or after expiry', async () => {
    recordExport.userWorkspaceId = 'someone-else';
    await expect(service.getDownloadUrl('export', requester)).rejects.toThrow(
      NotFoundException,
    );
    recordExport.userWorkspaceId = 'owner';
    recordExport.expiresAt = new Date(0);
    await expect(service.getDownloadUrl('export', requester)).rejects.toThrow(
      'expired',
    );
    expect(jwt.signAsyncOrThrow).not.toHaveBeenCalled();
  });

  it('rechecks read access before returning a file URL', async () => {
    recordExport.status = RecordExportStatus.COMPLETED;
    recordExport.filePath = 'export/file.csv';
    query.readPage.mockRejectedValue(new Error('Read access denied'));
    await expect(service.getDownloadUrl('export', requester)).rejects.toThrow(
      'Read access denied',
    );
    expect(jwt.signAsyncOrThrow).not.toHaveBeenCalled();
  });
});
