import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, LessThan, Not, Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import {
  PENDING_FILE_CLEANUP_BATCH_SIZE,
  PENDING_FILE_MAX_AGE_MS,
} from 'src/engine/core-modules/file/file-upload/crons/constants/pending-file-cleanup.constants';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';

@Injectable()
export class PendingFileCleanupService {
  private readonly logger = new Logger(PendingFileCleanupService.name);

  constructor(
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository -- the reaper runs in a cron with no workspace context and must sweep stale PENDING files across every workspace
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository -- resolves the application universalIdentifier of a cross-workspace file while reaping outside any workspace context
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
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
        workspaceId: Not(IsNull()),
      },
      take: PENDING_FILE_CLEANUP_BATCH_SIZE,
    });

    let deletedCount = 0;

    for (const file of staleFiles) {
      try {
        // Claim the row atomically: delete it only while it is still PENDING.
        // If completeFileUpload promoted it to UPLOADED between the fetch above
        // and here, the delete affects no rows and the now-live file (and its
        // object) are left untouched.
        const { affected } = await this.fileRepository.delete({
          id: file.id,
          status: FILE_STATUS.PENDING,
        });

        if (!isDefined(affected) || affected === 0) {
          continue;
        }

        await this.deleteStorageObject(file);

        deletedCount++;
      } catch (error) {
        this.logger.warn(
          `Failed to clean up stale pending file ${file.id} in workspace ${file.workspaceId}: ${error.message}`,
        );
      }
    }

    return deletedCount;
  }

  // The row has already been removed, so this only tidies the (possibly
  // partial, possibly absent) storage object. A failure here leaks bytes but
  // never data, so it is logged rather than retried.
  private async deleteStorageObject(file: FileEntity): Promise<void> {
    if (!isDefined(file.workspaceId)) {
      return;
    }

    const [fileFolder] = file.path.split('/');

    const application = await this.applicationRepository.findOne({
      where: { id: file.applicationId, workspaceId: file.workspaceId },
    });

    if (!isDefined(application)) {
      return;
    }

    await this.fileStorageService.deleteFile({
      workspaceId: file.workspaceId,
      applicationUniversalIdentifier: application.universalIdentifier,
      fileFolder: fileFolder as FileFolder,
      resourcePath: removeFileFolderFromFileEntityPath(file.path),
    });
  }
}
