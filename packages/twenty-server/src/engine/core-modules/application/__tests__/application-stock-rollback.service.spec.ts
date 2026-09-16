import { Test } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

const WORKSPACE_ID = 'workspace-1';
const APPLICATION_ID = 'application-1';

describe('ApplicationService stock rollback', () => {
  const buildService = async () => {
    const queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      isTransactionActive: true,
      manager: { update: jest.fn(), delete: jest.fn() },
    };
    const fileStorageService = {
      deleteApplicationFileRows: jest.fn(),
      deleteApplicationFilesFromStorage: jest.fn(),
      invalidateStorageStock: jest.fn(),
    };
    const module = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: getDataSourceToken(),
          useValue: { createQueryRunner: () => queryRunner },
        },
        { provide: FileStorageService, useValue: fileStorageService },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: {
            findOne: jest
              .fn()
              .mockResolvedValue({
                id: APPLICATION_ID,
                workspaceId: WORKSPACE_ID,
                universalIdentifier: 'application',
              }),
          },
        },
        {
          provide: WorkspaceCacheService,
          useValue: { invalidateAndRecompute: jest.fn() },
        },
        {
          provide: WorkspaceEventBroadcaster,
          useValue: { broadcast: jest.fn() },
        },
      ],
    })
      .useMocker(() => ({}))
      .compile();

    return {
      service: module.get(ApplicationService),
      queryRunner,
      fileStorageService,
    };
  };

  it('invalidates released stock after rolling back deleted file rows', async () => {
    const { service, queryRunner, fileStorageService } = await buildService();
    const failure = new Error('application deletion failed');
    queryRunner.manager.delete.mockRejectedValue(failure);

    await expect(service.delete('application', WORKSPACE_ID)).rejects.toBe(
      failure,
    );

    expect(fileStorageService.deleteApplicationFileRows).toHaveBeenCalled();
    expect(fileStorageService.invalidateStorageStock).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      applicationId: APPLICATION_ID,
    });
    expect(
      queryRunner.rollbackTransaction.mock.invocationCallOrder[0],
    ).toBeLessThan(
      fileStorageService.invalidateStorageStock.mock.invocationCallOrder[0],
    );
    expect(queryRunner.release).toHaveBeenCalled();
  });

  it('does not invalidate stock after a successful commit', async () => {
    const { service, queryRunner, fileStorageService } = await buildService();

    await service.delete('application', WORKSPACE_ID);

    expect(queryRunner.commitTransaction).toHaveBeenCalled();
    expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
    expect(fileStorageService.invalidateStorageStock).not.toHaveBeenCalled();
  });
});
