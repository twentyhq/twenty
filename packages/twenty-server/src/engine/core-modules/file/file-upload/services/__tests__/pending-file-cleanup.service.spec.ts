import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
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
  };

  const fileStorageService = {
    deleteByFileId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PendingFileCleanupService,
        {
          provide: getRepositoryToken(FileEntity),
          useValue: fileRepository,
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

  it('should delete each stale file from storage and return the deleted count', async () => {
    fileRepository.find.mockResolvedValue([
      {
        id: 'file-1',
        workspaceId: 'workspace-1',
        path: `${FileFolder.FilesField}/some/file-1.png`,
      },
      {
        id: 'file-2',
        workspaceId: 'workspace-2',
        path: `${FileFolder.Workflow}/file-2.pdf`,
      },
    ]);
    fileStorageService.deleteByFileId.mockResolvedValue(undefined);

    const deletedCount = await service.cleanupStalePendingFiles();

    expect(deletedCount).toBe(2);
    expect(fileStorageService.deleteByFileId).toHaveBeenCalledTimes(2);
    expect(fileStorageService.deleteByFileId).toHaveBeenNthCalledWith(1, {
      fileId: 'file-1',
      workspaceId: 'workspace-1',
      fileFolder: FileFolder.FilesField,
    });
    expect(fileStorageService.deleteByFileId).toHaveBeenNthCalledWith(2, {
      fileId: 'file-2',
      workspaceId: 'workspace-2',
      fileFolder: FileFolder.Workflow,
    });
  });

  it('should keep cleaning remaining files when one deletion fails', async () => {
    fileRepository.find.mockResolvedValue([
      {
        id: 'file-1',
        workspaceId: 'workspace-1',
        path: `${FileFolder.FilesField}/file-1.png`,
      },
      {
        id: 'file-2',
        workspaceId: 'workspace-2',
        path: `${FileFolder.FilesField}/file-2.png`,
      },
    ]);
    fileStorageService.deleteByFileId
      .mockRejectedValueOnce(new Error('storage exploded'))
      .mockResolvedValueOnce(undefined);

    const deletedCount = await service.cleanupStalePendingFiles();

    expect(deletedCount).toBe(1);
    expect(fileStorageService.deleteByFileId).toHaveBeenCalledTimes(2);
  });

  it('should not call storage when there are no stale files', async () => {
    fileRepository.find.mockResolvedValue([]);

    const deletedCount = await service.cleanupStalePendingFiles();

    expect(deletedCount).toBe(0);
    expect(fileStorageService.deleteByFileId).not.toHaveBeenCalled();
  });
});
