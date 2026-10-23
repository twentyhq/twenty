import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  WORKSPACE_DATA_EXPORT_STEP_JOB_NAME,
  WORKSPACE_DATA_EXPORT_STEP_MAX_ATTEMPTS,
  WORKSPACE_DATA_EXPORT_STEP_RETRY_DELAY_MS,
} from 'src/engine/core-modules/workspace-data-export/constants/workspace-data-export.constant';
import { WorkspaceDataExportArchiveService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-archive.service';
import { WorkspaceDataExportPartWriterService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-part-writer.service';
import { WorkspaceDataExportStateService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-state.service';
import { WorkspaceDataExportStorageService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-storage.service';
import { type WorkspaceDataExportJobData } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-job-data.type';
import { type WorkspaceDataExportState } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-state.type';
import { buildNextWorkspaceDataExportCursor } from 'src/engine/core-modules/workspace-data-export/utils/build-next-workspace-data-export-cursor.util';
import { buildWorkspaceDataExportResource } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-resource.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class WorkspaceDataExportStepService {
  private readonly logger = new Logger(WorkspaceDataExportStepService.name);

  constructor(
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly fileStorageService: FileStorageService,
    private readonly workspaceDataExportStateService: WorkspaceDataExportStateService,
    private readonly workspaceDataExportStorageService: WorkspaceDataExportStorageService,
    private readonly workspaceDataExportPartWriterService: WorkspaceDataExportPartWriterService,
    private readonly workspaceDataExportArchiveService: WorkspaceDataExportArchiveService,
    @InjectMessageQueue(MessageQueue.workspaceDataExportQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async enqueue({
    delay,
    ...jobData
  }: WorkspaceDataExportJobData & { delay?: number }): Promise<void> {
    const { exportId, cursor } = jobData;

    await this.messageQueueService.add(
      WORKSPACE_DATA_EXPORT_STEP_JOB_NAME,
      jobData,
      { id: `${exportId}:${cursor.stepIndex}:${cursor.attempt}`, delay },
    );
  }

  async runStep({
    workspaceId,
    exportId,
    cursor,
    abortSignal,
  }: WorkspaceDataExportJobData & {
    abortSignal?: AbortSignal;
  }): Promise<void> {
    const file = await this.fileRepository.findOne(workspaceId, {
      where: { id: exportId, status: FILE_STATUS.PENDING },
    });
    const state = await this.workspaceDataExportStateService.get({
      workspaceId,
      exportId,
    });

    if (!isDefined(file) || !isDefined(state)) {
      this.logger.warn(
        `Workspace ${workspaceId}: export ${exportId} is no longer pending, skipping step ${cursor.stepIndex}`,
      );

      return;
    }

    try {
      if (cursor.objectIndex >= state.objects.length) {
        await this.finalize({ workspaceId, exportId, state });

        return;
      }

      const object = state.objects[cursor.objectIndex];
      const part = await this.workspaceDataExportPartWriterService.writePart({
        workspaceId,
        exportId,
        cursor,
        object,
        abortSignal,
      });

      await this.workspaceDataExportStateService.set({
        workspaceId,
        exportId,
        state: {
          ...state,
          partsByObject: {
            ...state.partsByObject,
            [object.nameSingular]: [
              ...state.partsByObject[object.nameSingular].filter(
                (existingPart) => existingPart.name !== part.partName,
              ),
              { name: part.partName, recordCount: part.recordCount },
            ],
          },
          completedObjectCount: part.isLastPart
            ? cursor.objectIndex + 1
            : state.completedObjectCount,
          heartbeatAt: Date.now(),
        },
      });
      await this.enqueue({
        workspaceId,
        exportId,
        cursor: buildNextWorkspaceDataExportCursor({
          cursor,
          after: part.after,
          isLastPart: part.isLastPart,
        }),
      });
    } catch (error) {
      if (cursor.attempt + 1 < WORKSPACE_DATA_EXPORT_STEP_MAX_ATTEMPTS) {
        this.logger.warn(
          `Workspace ${workspaceId}: export ${exportId} step ${cursor.stepIndex} failed on attempt ${cursor.attempt + 1}, retrying`,
          error,
        );
        await this.enqueue({
          workspaceId,
          exportId,
          cursor: { ...cursor, attempt: cursor.attempt + 1 },
          delay: WORKSPACE_DATA_EXPORT_STEP_RETRY_DELAY_MS,
        });

        return;
      }

      this.logger.error(
        `Workspace ${workspaceId}: export ${exportId} failed at step ${cursor.stepIndex}`,
        error,
      );
      await this.workspaceDataExportStorageService.deleteExportFolder({
        workspaceId,
        exportId,
      });
      throw error;
    }
  }

  private async finalize({
    workspaceId,
    exportId,
    state,
  }: {
    workspaceId: string;
    exportId: string;
    state: WorkspaceDataExportState;
  }): Promise<void> {
    const sizeInBytes =
      await this.workspaceDataExportArchiveService.writeArchive({
        workspaceId,
        exportId,
        state,
        onPartAdded: () =>
          this.workspaceDataExportStateService.set({
            workspaceId,
            exportId,
            state: { ...state, heartbeatAt: Date.now() },
          }),
      });
    const { affected } = await this.fileRepository.update(
      workspaceId,
      { id: exportId, status: FILE_STATUS.PENDING },
      {
        status: FILE_STATUS.UPLOADED,
        size: sizeInBytes,
        mimeType: 'application/zip',
      },
    );

    if (affected === 0) {
      this.logger.warn(
        `Workspace ${workspaceId}: export ${exportId} file is gone, dropping its archive`,
      );
      await this.fileStorageService.deleteFileObject(
        buildWorkspaceDataExportResource({
          workspaceId,
          exportId,
          file: { type: 'archive' },
        }),
      );

      return;
    }

    await this.workspaceDataExportStorageService.deleteParts({
      workspaceId,
      exportId,
    });
  }
}
