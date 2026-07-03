import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';
import { LessThan, Repository } from 'typeorm';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import {
  PENDING_FILE_CLEANUP_BATCH_SIZE,
  PENDING_FILE_MAX_AGE_MS,
} from 'src/engine/core-modules/file/file-upload/crons/constants/pending-file-cleanup.constants';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';

@Injectable()
export class PendingFileCleanupService {
  private readonly logger = new Logger(PendingFileCleanupService.name);

  constructor(
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository -- the reaper runs in a cron with no workspace context and must sweep stale PENDING files across every workspace
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly fileStorageService: FileStorageService,
  ) {}

  // Deletes file records stuck in PENDING (direct uploads that were initiated
  // but never completed) together with any partially uploaded object. Never
  // promotes to UPLOADED: a file that was never confirmed is referenced by
  // nothing, the client recovery path is re-uploading under a fresh fileId.
  async cleanupStalePendingFiles(): Promise<number> {
    const staleThreshold = new Date(Date.now() - PENDING_FILE_MAX_AGE_MS);

    const staleFiles = await this.fileRepository.find({
      where: {
        status: FILE_STATUS.PENDING,
        createdAt: LessThan(staleThreshold),
      },
      take: PENDING_FILE_CLEANUP_BATCH_SIZE,
    });

    let deletedCount = 0;

    for (const file of staleFiles) {
      const [fileFolder] = file.path.split('/');

      try {
        // Deletes the storage object (tolerates a missing one) and
        // hard-deletes the file record.
        await this.fileStorageService.deleteByFileId({
          fileId: file.id,
          workspaceId: file.workspaceId,
          fileFolder: fileFolder as FileFolder,
        });

        deletedCount++;
      } catch (error) {
        this.logger.warn(
          `Failed to clean up stale pending file ${file.id} in workspace ${file.workspaceId}: ${error.message}`,
        );
      }
    }

    return deletedCount;
  }
}
