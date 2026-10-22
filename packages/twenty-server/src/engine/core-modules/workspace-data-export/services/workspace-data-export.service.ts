import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Like, type Repository } from 'typeorm';
import { v4 } from 'uuid';

import { buildSystemAuthContext } from 'src/engine/core-modules/auth/utils/build-system-auth-context.util';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { WORKSPACE_DATA_EXPORT_REQUESTED_EVENT } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/workspace-data-export/workspace-data-export-requested';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { RecordExportQueryService } from 'src/engine/core-modules/record-export/services/record-export-query.service';
import { type WorkspaceDataExportDTO } from 'src/engine/core-modules/workspace-data-export/dtos/workspace-data-export.dto';
import { WorkspaceDataExportStatus } from 'src/engine/core-modules/workspace-data-export/enums/workspace-data-export-status.enum';
import { WorkspaceDataExportStateService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-state.service';
import { WorkspaceDataExportStepService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-step.service';
import { WorkspaceDataExportStorageService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-storage.service';
import { type WorkspaceDataExportState } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-state.type';
import { buildWorkspaceDataExportObjects } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-objects.util';
import { buildWorkspaceDataExportResource } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-resource.util';
import { buildWorkspaceDataExportObjectSelections } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-object-selections.util';
import { isWorkspaceDataExportStale } from 'src/engine/core-modules/workspace-data-export/utils/is-workspace-data-export-stale.util';
import { WorkspaceDataExportException } from 'src/engine/core-modules/workspace-data-export/workspace-data-export.exception';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class WorkspaceDataExportService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly fileStorageService: FileStorageService,
    private readonly fileUrlService: FileUrlService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly eventLogEmitterService: EventLogEmitterService,
    private readonly recordExportQueryService: RecordExportQueryService,
    private readonly workspaceDataExportStateService: WorkspaceDataExportStateService,
    private readonly workspaceDataExportStepService: WorkspaceDataExportStepService,
    private readonly workspaceDataExportStorageService: WorkspaceDataExportStorageService,
  ) {}

  async create({
    workspaceId,
    actorUserId,
  }: {
    workspaceId: string;
    actorUserId: string;
  }): Promise<WorkspaceDataExportDTO> {
    const workspace = await this.findWorkspaceOrThrow(workspaceId);

    await this.discardStaleExportsOrThrow(workspaceId);

    const exportId = v4();
    const file = await this.fileStorageService.createPendingFile({
      ...buildWorkspaceDataExportResource({
        workspaceId,
        exportId,
        file: { type: 'archive' },
      }),
      fileId: exportId,
      size: 0,
      mimeType: 'application/octet-stream',
      settings: { isTemporaryFile: true, toDelete: false },
    });
    const state = await this.buildInitialState(workspace);

    await this.workspaceDataExportStateService.set({
      workspaceId,
      exportId,
      state,
    });
    await this.workspaceDataExportStepService.enqueue({
      workspaceId,
      exportId,
      cursor: {
        objectIndex: 0,
        after: null,
        partIndex: 0,
        stepIndex: 0,
        attempt: 0,
      },
    });

    void this.eventLogEmitterService
      .createContext({ workspaceId, userId: actorUserId })
      .insertWorkspaceEvent(WORKSPACE_DATA_EXPORT_REQUESTED_EVENT, {
        exportId,
        actorUserId,
      });

    return this.toDTO({ workspaceId, file, state });
  }

  async findMany(workspaceId: string): Promise<WorkspaceDataExportDTO[]> {
    const files = await this.fileRepository.find(workspaceId, {
      where: { path: Like(`${FileFolder.WorkspaceDataExport}/%`) },
      order: { createdAt: 'DESC' },
    });

    return Promise.all(
      files.map(async (file) =>
        this.toDTO({
          workspaceId,
          file,
          state: await this.workspaceDataExportStateService.get({
            workspaceId,
            exportId: file.id,
          }),
        }),
      ),
    );
  }

  private async discardStaleExportsOrThrow(workspaceId: string): Promise<void> {
    const pendingExports = await this.fileRepository.find(workspaceId, {
      where: {
        path: Like(`${FileFolder.WorkspaceDataExport}/%`),
        status: FILE_STATUS.PENDING,
      },
    });

    for (const pendingExport of pendingExports) {
      const state = await this.workspaceDataExportStateService.get({
        workspaceId,
        exportId: pendingExport.id,
      });

      if (!isWorkspaceDataExportStale(state)) {
        throw new WorkspaceDataExportException({
          message: `An export is already running for workspace ${workspaceId}`,
          code: 'EXPORT_ALREADY_RUNNING',
        });
      }

      await this.workspaceDataExportStorageService.discard({
        workspaceId,
        file: pendingExport,
      });
    }
  }

  private async buildInitialState(
    workspace: WorkspaceEntity,
  ): Promise<WorkspaceDataExportState> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspace.id, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);
    const authContext = buildSystemAuthContext({
      workspace: fromWorkspaceEntityToFlat(workspace),
    });
    const objects = await Promise.all(
      buildWorkspaceDataExportObjectSelections({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }).map(async ({ fieldMetadataIds, ...objectSelection }) => {
        const { columns } = await this.recordExportQueryService.buildContext({
          parameters: {
            objectMetadataId: objectSelection.objectMetadataId,
            fieldMetadataIds,
          },
          authContext,
          shouldIncludeInactiveFields: true,
        });

        return {
          ...objectSelection,
          columns,
          fieldCount: fieldMetadataIds.length,
        };
      }),
    );
    const now = Date.now();

    return {
      workspaceName: workspace.displayName ?? '',
      objects,
      partsByObject: Object.fromEntries(
        objects.map((object) => [object.nameSingular, []]),
      ),
      completedObjectCount: 0,
      startedAt: now,
      heartbeatAt: now,
    };
  }

  private async findWorkspaceOrThrow(
    workspaceId: string,
  ): Promise<WorkspaceEntity> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!isDefined(workspace)) {
      throw new WorkspaceDataExportException({
        message: `Workspace ${workspaceId} not found`,
        code: 'WORKSPACE_NOT_FOUND',
      });
    }

    return workspace;
  }

  private async toDTO({
    workspaceId,
    file,
    state,
  }: {
    workspaceId: string;
    file: FileEntity;
    state: WorkspaceDataExportState | undefined;
  }): Promise<WorkspaceDataExportDTO> {
    const status = this.getStatus({ file, state });

    return {
      id: file.id,
      workspaceId,
      status,
      sizeInBytes: Number(file.size),
      createdAt: file.createdAt,
      objects: isDefined(state) ? buildWorkspaceDataExportObjects(state) : [],
      downloadUrl:
        status === WorkspaceDataExportStatus.COMPLETED
          ? await this.fileUrlService.signFileByIdUrl({
              fileId: file.id,
              workspaceId,
              fileFolder: FileFolder.WorkspaceDataExport,
            })
          : null,
    };
  }

  private getStatus({
    file,
    state,
  }: {
    file: FileEntity;
    state: WorkspaceDataExportState | undefined;
  }): WorkspaceDataExportStatus {
    if (file.status === FILE_STATUS.UPLOADED) {
      return WorkspaceDataExportStatus.COMPLETED;
    }

    return isWorkspaceDataExportStale(state)
      ? WorkspaceDataExportStatus.FAILED
      : WorkspaceDataExportStatus.PENDING;
  }
}
