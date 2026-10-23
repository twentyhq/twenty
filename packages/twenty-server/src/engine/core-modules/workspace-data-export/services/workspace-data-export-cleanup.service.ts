import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, LessThan, Like, Not, type Repository } from 'typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import {
  WORKSPACE_DATA_EXPORT_CLEANUP_BATCH_SIZE,
  WORKSPACE_DATA_EXPORT_RETENTION_MS,
  WORKSPACE_DATA_EXPORT_STALE_AFTER_MS,
} from 'src/engine/core-modules/workspace-data-export/constants/workspace-data-export.constant';
import { WorkspaceDataExportStateService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-state.service';
import { WorkspaceDataExportStorageService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-storage.service';
import { isWorkspaceDataExportStale } from 'src/engine/core-modules/workspace-data-export/utils/is-workspace-data-export-stale.util';

@Injectable()
export class WorkspaceDataExportCleanupService {
  private readonly logger = new Logger(WorkspaceDataExportCleanupService.name);

  constructor(
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository -- the cron sweeps expired exports across every workspace
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly workspaceDataExportStateService: WorkspaceDataExportStateService,
    private readonly workspaceDataExportStorageService: WorkspaceDataExportStorageService,
  ) {}

  async cleanupExpiredExports(): Promise<number> {
    const now = Date.now();
    const exportPath = Like(`${FileFolder.WorkspaceDataExport}/%`);
    const candidateExports = await this.fileRepository.find({
      where: [
        {
          path: exportPath,
          workspaceId: Not(IsNull()),
          status: FILE_STATUS.UPLOADED,
          updatedAt: LessThan(
            new Date(now - WORKSPACE_DATA_EXPORT_RETENTION_MS),
          ),
        },
        {
          path: exportPath,
          workspaceId: Not(IsNull()),
          status: FILE_STATUS.PENDING,
          createdAt: LessThan(
            new Date(now - WORKSPACE_DATA_EXPORT_STALE_AFTER_MS),
          ),
        },
      ],
      take: WORKSPACE_DATA_EXPORT_CLEANUP_BATCH_SIZE,
    });
    let deletedCount = 0;

    for (const candidateExport of candidateExports) {
      if (!isDefined(candidateExport.workspaceId)) {
        continue;
      }

      try {
        if (
          !(await this.isExpired({
            file: candidateExport,
            workspaceId: candidateExport.workspaceId,
            now,
          }))
        ) {
          continue;
        }

        await this.workspaceDataExportStorageService.discard({
          workspaceId: candidateExport.workspaceId,
          file: candidateExport,
        });
        deletedCount++;
      } catch (error) {
        this.logger.warn(
          `Workspace ${candidateExport.workspaceId}: failed to delete expired export ${candidateExport.id}`,
          error,
        );
      }
    }

    return deletedCount;
  }

  private async isExpired({
    file,
    workspaceId,
    now,
  }: {
    file: Pick<FileEntity, 'id' | 'updatedAt' | 'status'>;
    workspaceId: string;
    now: number;
  }): Promise<boolean> {
    if (file.status === FILE_STATUS.UPLOADED) {
      return (
        file.updatedAt.getTime() < now - WORKSPACE_DATA_EXPORT_RETENTION_MS
      );
    }

    return isWorkspaceDataExportStale(
      await this.workspaceDataExportStateService.get({
        workspaceId,
        exportId: file.id,
      }),
    );
  }
}
