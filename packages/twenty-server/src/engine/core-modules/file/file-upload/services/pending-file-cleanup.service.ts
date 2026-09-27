import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, LessThan, Like, MoreThan, Not, Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import {
  PENDING_FILE_CLEANUP_BATCH_SIZE,
  PENDING_FILE_MAX_AGE_MS,
  RECORD_EXPORT_FILE_MAX_AGE_MS,
  RECORD_IMPORT_FILE_MIN_AGE_MS,
} from 'src/engine/core-modules/file/file-upload/crons/constants/pending-file-cleanup.constants';
import { buildPendingUploadResourcePath } from 'src/engine/core-modules/file/file-upload/utils/build-pending-upload-resource-path.util';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { getRecordImportSessionCacheKey } from 'src/engine/core-modules/record-import/utils/get-record-import-session-cache-key.util';
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
    @Inject(CacheStorageNamespace.EngineRecordImport)
    private readonly recordImportCacheStorageService: CacheStorageService,
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

    return deletedCount + (await this.cleanupExpiredRecordImportFiles());
  }

  // Import files outlive their upload: they are kept while their session
  // exists, however long mapping and review take, and reaped once it expired.
  private async cleanupExpiredRecordImportFiles(): Promise<number> {
    const threshold = new Date(Date.now() - RECORD_IMPORT_FILE_MIN_AGE_MS);
    let deletedCount = 0;
    let lastFileId: string | undefined;
    let files: FileEntity[];

    do {
      files = await this.fileRepository.find({
        where: {
          path: Like(`${FileFolder.RecordImport}/%`),
          status: FILE_STATUS.UPLOADED,
          createdAt: LessThan(threshold),
          workspaceId: Not(IsNull()),
          ...(isDefined(lastFileId) ? { id: MoreThan(lastFileId) } : {}),
        },
        order: { id: 'ASC' },
        take: PENDING_FILE_CLEANUP_BATCH_SIZE,
      });

      if (files.length === 0) {
        break;
      }

      lastFileId = files[files.length - 1].id;

      const sessions = await this.recordImportCacheStorageService.mget(
        files.map((file) =>
          getRecordImportSessionCacheKey({
            workspaceId: file.workspaceId ?? '',
            id: this.getRecordImportSessionId(file.path),
          }),
        ),
      );

      for (const [index, file] of files.entries()) {
        if (isDefined(sessions[index]) || !isDefined(file.workspaceId)) {
          continue;
        }

        try {
          await this.fileStorageService.deleteByFileId({
            fileId: file.id,
            workspaceId: file.workspaceId,
            fileFolder: FileFolder.RecordImport,
          });
          deletedCount++;
        } catch (error) {
          this.logger.warn(
            `Failed to clean up import file ${file.id} in workspace ${file.workspaceId}: ${error.message}`,
          );
        }
      }
    } while (files.length === PENDING_FILE_CLEANUP_BATCH_SIZE);

    return deletedCount;
  }

  // Import paths start with the session id, a UUID: "<id>.csv" for the
  // upload, "<id>-working/..." for the files derived from it
  private getRecordImportSessionId(path: string): string {
    return removeFileFolderFromFileEntityPath(path).slice(0, 36);
  }

  // The row has already been removed, so this only tidies the (possibly
  // partial, possibly absent) storage object. A failure here leaks bytes but
  // never data, so it is logged rather than retried.
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

    // Normally the object is still in quarantine, but a crash between the move
    // and the row update leaves it at its final path with the row PENDING.
    //
    // Quarantine goes first and the two are not concurrent: while a
    // quarantined object still exists, a completion racing this cleanup can
    // move it into the final path after that path has been deleted, orphaning
    // an object no later run will look for. Both still run regardless of the
    // other's outcome, since the row is already gone.
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
