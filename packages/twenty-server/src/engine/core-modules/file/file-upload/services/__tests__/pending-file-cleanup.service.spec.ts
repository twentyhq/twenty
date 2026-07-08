import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import {
  PENDING_FILE_CLEANUP_BATCH_SIZE,
  PENDING_FILE_MAX_AGE_MS,
} from 'src/engine/core-modules/file/file-upload/crons/constants/pending-file-cleanup.constants';
import { PendingFileCleanupService } from 'src/engine/core-modules/file/file-upload/services/pending-file-cleanup.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';

describe('PendingFileCleanupService', () => {
  let service: PendingFileCleanupService;

  const fileRepository = {
    find: jest.fn(),
    delete: jest.fn(),
  };

  const applicationRepository = {
    findOne: jest.fn(),
  };

  const fileStorageService = {
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    applicationRepository.findOne.mockResolvedValue({
      id: 'application-id',
      universalIdentifier: 'application-uid',
    });
    fileRepository.delete.mockResolvedValue({ affected: 1 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PendingFileCleanupService,
        {
          provide: getRepositoryToken(FileEntity),
          useValue: fileRepository,
        },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: applicationRepository,
        },
        {
          provide: FileStorageService,
          useValue: fileStorageService,
        },
      ],
    }).compile();

    service = module.get<PendingFileCleanupService>(PendingFileCleanupService);
  });

  it('should query for stale pending files with the batch size cap', async () => {
    fileRepository.find.mockResolvedValue([]);

    const before = Date.now() - PENDING_FILE_MAX_AGE_MS;

    await service.cleanupStalePendingFiles();

    const after = Date.now() - PENDING_FILE_MAX_AGE_MS;

    expect(fileRepository.find).toHaveBeenCalledTimes(1);

    const where = fileRepository.find.mock.calls[0][0].where;

    expect(where.status).toBe(FILE_STATUS.PENDING);
    // LessThan wraps the threshold in _value
    const threshold = where.createdAt._value.getTime();

    expect(threshold).toBeGreaterThanOrEqual(before);
    expect(threshold).toBeLessThanOrEqual(after);
    expect(fileRepository.find.mock.calls[0][0].take).toBe(
      PENDING_FILE_CLEANUP_BATCH_SIZE,
    );
  });

  it('should delete each stale file guarded by status and return the deleted count', async () => {
    fileRepository.find.mockResolvedValue([
      {
        id: 'file-1',
        workspaceId: 'workspace-1',
        applicationId: 'application-id',
        path: `${FileFolder.FilesField}/some/file-1.png`,
      },
      {
        id: 'file-2',
        workspaceId: 'workspace-2',
        applicationId: 'application-id',
        path: `${FileFolder.Workflow}/file-2.pdf`,
      },
    ]);

    const deletedCount = await service.cleanupStalePendingFiles();

    expect(deletedCount).toBe(2);
    expect(fileRepository.delete).toHaveBeenNthCalledWith(1, {
      id: 'file-1',
      status: FILE_STATUS.PENDING,
    });
    expect(fileRepository.delete).toHaveBeenNthCalledWith(2, {
      id: 'file-2',
      status: FILE_STATUS.PENDING,
    });
    expect(fileStorageService.deleteFile).toHaveBeenNthCalledWith(1, {
      workspaceId: 'workspace-1',
      applicationUniversalIdentifier: 'application-uid',
      fileFolder: FileFolder.FilesField,
      resourcePath: 'some/file-1.png',
    });
    expect(fileStorageService.deleteFile).toHaveBeenNthCalledWith(2, {
      workspaceId: 'workspace-2',
      applicationUniversalIdentifier: 'application-uid',
      fileFolder: FileFolder.Workflow,
      resourcePath: 'file-2.pdf',
    });
  });

  it('should skip storage deletion when the file was confirmed concurrently', async () => {
    fileRepository.find.mockResolvedValue([
      {
        id: 'file-1',
        workspaceId: 'workspace-1',
        applicationId: 'application-id',
        path: `${FileFolder.FilesField}/file-1.png`,
      },
    ]);
    // A racing completeFileUpload promoted the row, so the guarded delete is a no-op.
    fileRepository.delete.mockResolvedValueOnce({ affected: 0 });

    const deletedCount = await service.cleanupStalePendingFiles();

    expect(deletedCount).toBe(0);
    expect(fileStorageService.deleteFile).not.toHaveBeenCalled();
  });

  it('should keep cleaning remaining files when one deletion fails', async () => {
    fileRepository.find.mockResolvedValue([
      {
        id: 'file-1',
        workspaceId: 'workspace-1',
        applicationId: 'application-id',
        path: `${FileFolder.FilesField}/file-1.png`,
      },
      {
        id: 'file-2',
        workspaceId: 'workspace-2',
        applicationId: 'application-id',
        path: `${FileFolder.FilesField}/file-2.png`,
      },
    ]);
    fileStorageService.deleteFile
      .mockRejectedValueOnce(new Error('storage exploded'))
      .mockResolvedValueOnce(undefined);

    const deletedCount = await service.cleanupStalePendingFiles();

    expect(deletedCount).toBe(1);
    expect(fileStorageService.deleteFile).toHaveBeenCalledTimes(2);
  });

  it('should not delete anything when there are no stale files', async () => {
    fileRepository.find.mockResolvedValue([]);

    const deletedCount = await service.cleanupStalePendingFiles();

    expect(deletedCount).toBe(0);
    expect(fileRepository.delete).not.toHaveBeenCalled();
    expect(fileStorageService.deleteFile).not.toHaveBeenCalled();
  });
});
