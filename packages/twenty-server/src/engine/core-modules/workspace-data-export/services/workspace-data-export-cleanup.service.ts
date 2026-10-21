import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, LessThan, Like, Not, type Repository } from 'typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import {
  WORKSPACE_DATA_EXPORT_ABANDONED_AFTER_MS,
  WORKSPACE_DATA_EXPORT_CLEANUP_BATCH_SIZE,
  WORKSPACE_DATA_EXPORT_RETENTION_MS,
} from 'src/engine/core-modules/workspace-data-export/constants/workspace-data-export.constant';
import { WorkspaceDataExportStorageService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-storage.service';

@Injectable()
export class WorkspaceDataExportCleanupService {
  private readonly logger = new Logger(WorkspaceDataExportCleanupService.name);

  constructor(
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository -- the cron sweeps expired exports across every workspace
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly workspaceDataExportStorageService: WorkspaceDataExportStorageService,
  ) {}

  async cleanupExpiredExports(): Promise<number> {
    const now = Date.now();
    const exportPath = Like(`${FileFolder.WorkspaceDataExport}/%`);
    const expiredExports = await this.fileRepository.find({
      where: [
        {
          path: exportPath,
          workspaceId: Not(IsNull()),
          createdAt: LessThan(
            new Date(now - WORKSPACE_DATA_EXPORT_RETENTION_MS),
          ),
        },
        {
          path: exportPath,
          workspaceId: Not(IsNull()),
          status: FILE_STATUS.PENDING,
          createdAt: LessThan(
            new Date(now - WORKSPACE_DATA_EXPORT_ABANDONED_AFTER_MS),
          ),
        },
      ],
      take: WORKSPACE_DATA_EXPORT_CLEANUP_BATCH_SIZE,
    });
    let deletedCount = 0;

    for (const expiredExport of expiredExports) {
      if (!isDefined(expiredExport.workspaceId)) {
        continue;
      }

      try {
        await this.workspaceDataExportStorageService.discard({
          workspaceId: expiredExport.workspaceId,
          file: expiredExport,
        });
        deletedCount++;
      } catch (error) {
        this.logger.warn(
          `Workspace ${expiredExport.workspaceId}: failed to delete expired export ${expiredExport.id}`,
          error,
        );
      }
    }

    return deletedCount;
  }
}
