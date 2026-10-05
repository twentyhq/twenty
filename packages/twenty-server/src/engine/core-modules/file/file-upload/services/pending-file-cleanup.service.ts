import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, LessThan, Like, Not, Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import {
  PENDING_FILE_CLEANUP_BATCH_SIZE,
  PENDING_FILE_MAX_AGE_MS,
  RECORD_EXPORT_FILE_MAX_AGE_MS,
} from 'src/engine/core-modules/file/file-upload/crons/constants/pending-file-cleanup.constants';
import { buildPendingUploadResourcePath } from 'src/engine/core-modules/file/file-upload/utils/build-pending-upload-resource-path.util';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class PendingFileCleanupService {
  private readonly logger = new Logger(PendingFileCleanupService.name);

  constructor(
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository -- the reaper runs in a cron with no workspace context and must sweep stale PENDING files across every workspace
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    @InjectWorkspaceScopedRepository(ApplicationEntity)
    private readonly applicationRepository: WorkspaceScopedRepository<ApplicationEntity>,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async cleanupStaleFiles(): Promise<number> {
    const staleThreshold = new Date(Date.now() - PENDING_FILE_MAX_AGE_MS);
    const exportThreshold = new Date(
      Date.now() - RECORD_EXPORT_FILE_MAX_AGE_MS,
    );

    const staleFiles = await this.fileRepository.find({
      where: [
        {
          status: FILE_STATUS.PENDING,
          createdAt: LessThan(staleThreshold),
          workspaceId: Not(IsNull()),
        },
        {
          path: Like(`${FileFolder.RecordExport}/%`),
          createdAt: LessThan(exportThreshold),
          workspaceId: Not(IsNull()),
        },
      ],
      take: PENDING_FILE_CLEANUP_BATCH_SIZE,
    });

    let deletedCount = 0;

    for (const file of staleFiles) {
      try {
        if (
          file.path.startsWith(`${FileFolder.RecordExport}/`) &&
          isDefined(file.workspaceId)
        ) {
          await this.fileStorageService.deleteByFileId({
            fileId: file.id,
            workspaceId: file.workspaceId,
            fileFolder: FileFolder.RecordExport,
          });
          deletedCount++;

          continue;
        }

        // Delete only while still PENDING, so a file completeFileUpload just promoted is left untouched.
        const { affected } = await this.fileRepository.delete({
          id: file.id,
          status: FILE_STATUS.PENDING,
        });

        if (!isDefined(affected) || affected === 0) {
          continue;
        }

        if (isDefined(file.workspaceId)) {
          await this.fileStorageService.releaseStorageStock({
            workspaceId: file.workspaceId,
            applicationId: file.applicationId,
            bytes: file.size,
            quantity: 1,
          });
        }

        await this.deleteStorageObject(file);

        deletedCount++;
      } catch (error) {
        this.logger.warn(
          `Failed to clean up stale file ${file.id} in workspace ${file.workspaceId}: ${error.message}`,
        );
      }
    }

    return deletedCount;
  }

  // The row is already gone, so a failure here only leaks bytes and is logged rather than retried.
  private async deleteStorageObject(file: FileEntity): Promise<void> {
    if (!isDefined(file.workspaceId)) {
      return;
    }

    const [fileFolder] = file.path.split('/');

    const application = await this.applicationRepository.findOne(
      file.workspaceId,
      {
        where: { id: file.applicationId },
      },
    );

    if (!isDefined(application)) {
      return;
    }

    const resourcePath = removeFileFolderFromFileEntityPath(file.path);

    const location = {
      workspaceId: file.workspaceId,
      applicationUniversalIdentifier: application.universalIdentifier,
      fileFolder: fileFolder as FileFolder,
    };

    // A crash between move and row update leaves the object at its final path, so both are deleted.
    // Quarantine goes first: a racing completion could otherwise move it into an already-cleaned final path.
    const failures: unknown[] = [];

    for (const pathToDelete of [
      buildPendingUploadResourcePath({ fileId: file.id, resourcePath }),
      resourcePath,
    ]) {
      try {
        await this.fileStorageService.deleteFileObject({
          ...location,
          resourcePath: pathToDelete,
        });
      } catch (error) {
        failures.push(error);
      }
    }

    if (failures.length > 0) {
      throw failures[0];
    }
  }
}
