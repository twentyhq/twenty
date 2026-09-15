import { NotFoundException } from '@nestjs/common';
import { IsNull } from 'typeorm';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RecordExportStatus } from 'src/engine/core-modules/record-export/enums/record-export-status.enum';
import { RecordExportEntity } from 'src/engine/core-modules/record-export/record-export.entity';
import { RecordExportQueryWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export-query.workspace-service';
import { RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

describe('RecordExportWorkspaceService', () => {
  const repository = {
    insertAndReturnOne: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const queue = { add: jest.fn(), getJobs: jest.fn() };
  const query = {
    assertCanExport: jest.fn(),
    buildContext: jest.fn(),
    readPage: jest.fn(),
  };
  const broadcaster = { broadcastRecordExportEvent: jest.fn() };
  const jwt = { signAsyncOrThrow: jest.fn() };
  const requester = {
    type: 'user',
    workspace: { id: 'workspace' },
    userWorkspaceId: 'owner',
    workspaceMemberId: 'member',
  } as UserWorkspaceAuthContext;
  const service = new RecordExportWorkspaceService(
    repository as unknown as WorkspaceScopedRepository<RecordExportEntity>,
    queue as unknown as MessageQueueService,
    query as unknown as RecordExportQueryWorkspaceService,
    broadcaster as unknown as WorkspaceEventBroadcaster,
    {} as FileStorageService,
    jwt as unknown as JwtWrapperService,
    { get: () => 'https://crm.example' } as unknown as TwentyConfigService,
  );
  let recordExport: RecordExportEntity;

  beforeEach(() => {
    jest.resetAllMocks();
    recordExport = Object.assign(new RecordExportEntity(), {
      id: 'export',
      workspaceId: 'workspace',
      userWorkspaceId: 'owner',
      workspaceMemberId: 'member',
      status: RecordExportStatus.QUEUED,
      parameters: { objectMetadataId: 'person', fieldMetadataIds: ['name'] },
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 3600_000),
      attemptId: null,
    });
    query.assertCanExport.mockResolvedValue(requester);
    query.buildContext.mockResolvedValue({
      queryRunnerContext: { flatObjectMetadata: { nameSingular: 'person' } },
    });
    repository.insertAndReturnOne.mockResolvedValue(recordExport);
    repository.findOne.mockImplementation(async () => recordExport);
    repository.update.mockImplementation(
      async (_workspace: string, _criteria: object, values: object) => {
        Object.assign(recordExport, values);
        return { affected: 1 };
      },
    );
    repository.find.mockResolvedValue([recordExport]);
    queue.add.mockResolvedValue('job');
    queue.getJobs.mockResolvedValue({});
    broadcaster.broadcastRecordExportEvent.mockResolvedValue(undefined);
  });

  it('persists the requester and selection before adding a job', async () => {
    await service.create(recordExport.parameters, requester);
    expect(repository.insertAndReturnOne).toHaveBeenCalledWith(
      'workspace',
      expect.objectContaining({
        userWorkspaceId: 'owner',
        workspaceMemberId: 'member',
        parameters: recordExport.parameters,
      }),
    );
    expect(
      repository.insertAndReturnOne.mock.invocationCallOrder[0],
    ).toBeLessThan(queue.add.mock.invocationCallOrder[0]);
    expect(queue.add).toHaveBeenCalledWith(
      'GenerateRecordExportJob',
      { workspaceId: 'workspace', recordExportId: 'export' },
      { id: 'export' },
    );
  });

  it('releases the active export slot if enqueueing fails', async () => {
    queue.add.mockRejectedValue(new Error('Redis unavailable'));
    await expect(
      service.create(recordExport.parameters, requester),
    ).rejects.toThrow('Redis unavailable');
    expect(recordExport.status).toBe(RecordExportStatus.FAILED);
  });

  it('rejects downloads and retries belonging to a different requester', async () => {
    recordExport.userWorkspaceId = 'someone-else';
    await expect(service.getDownloadUrl('export', requester)).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.retry('export', requester)).rejects.toThrow(
      NotFoundException,
    );
    expect(jwt.signAsyncOrThrow).not.toHaveBeenCalled();
    expect(queue.add).not.toHaveBeenCalled();
  });

  it('recovers orphaned jobs and fences recovery by attempt instead of timestamp precision', async () => {
    recordExport.createdAt = new Date(Date.now() - 120_000);
    await service.reconcile(recordExport);
    expect(repository.update).toHaveBeenCalledWith(
      'workspace',
      expect.objectContaining({ id: 'export', attemptId: IsNull() }),
      expect.objectContaining({ status: RecordExportStatus.FAILED }),
    );
    expect(repository.update.mock.calls[0][1]).not.toHaveProperty('updatedAt');
    expect(recordExport.status).toBe(RecordExportStatus.FAILED);
  });

  it('does not fail an export while its job is still being enqueued', async () => {
    await service.reconcile(recordExport);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('keeps completed downloads available if SSE publishing fails', async () => {
    broadcaster.broadcastRecordExportEvent.mockRejectedValue(
      new Error('SSE unavailable'),
    );
    await expect(service.publish(recordExport)).resolves.toBeUndefined();
  });

  it('only lists nonexpired exports for the requester', async () => {
    await service.findMine(requester);
    expect(repository.find).toHaveBeenCalledWith(
      'workspace',
      expect.objectContaining({
        where: expect.objectContaining({
          userWorkspaceId: 'owner',
          expiresAt: expect.anything(),
        }),
      }),
    );
  });

  it('does not issue URLs for unfinished or expired files', async () => {
    await expect(service.getDownloadUrl('export', requester)).rejects.toThrow(
      'not ready',
    );
    Object.assign(recordExport, {
      status: RecordExportStatus.COMPLETED,
      filePath: 'export/file.csv',
      expiresAt: new Date(0),
    });
    await expect(service.getDownloadUrl('export', requester)).rejects.toThrow(
      'expired',
    );
    expect(jwt.signAsyncOrThrow).not.toHaveBeenCalled();
  });
  it('does not issue a download URL after field or object read access is revoked', async () => {
    Object.assign(recordExport, {
      status: RecordExportStatus.COMPLETED,
      filePath: 'export/file.csv',
    });
    query.readPage.mockRejectedValue(new Error('Read access denied'));
    await expect(service.getDownloadUrl('export', requester)).rejects.toThrow(
      'Read access denied',
    );
    expect(jwt.signAsyncOrThrow).not.toHaveBeenCalled();
  });
});
