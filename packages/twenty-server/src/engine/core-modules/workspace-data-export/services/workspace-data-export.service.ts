import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Like, type Repository } from 'typeorm';
import { v4 } from 'uuid';

import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { WORKSPACE_DATA_EXPORT_REQUESTED_EVENT } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/workspace-data-export/workspace-data-export-requested';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { WORKSPACE_DATA_EXPORT_STALE_AFTER_MS } from 'src/engine/core-modules/workspace-data-export/constants/workspace-data-export.constant';
import { type WorkspaceDataExportDTO } from 'src/engine/core-modules/workspace-data-export/dtos/workspace-data-export.dto';
import { WorkspaceDataExportStatus } from 'src/engine/core-modules/workspace-data-export/enums/workspace-data-export-status.enum';
import { WorkspaceDataExportStateService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-state.service';
import { WorkspaceDataExportStepService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-step.service';
import { WorkspaceDataExportStorageService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-storage.service';
import { type WorkspaceDataExportColumn } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-column.type';
import { type WorkspaceDataExportState } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-state.type';
import { type WorkspaceDataExportTable } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-table.type';
import { WorkspaceDataExportException } from 'src/engine/core-modules/workspace-data-export/workspace-data-export.exception';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/generate-column-definitions.util';

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

      if (!this.isStale(state)) {
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

    const exportId = v4();
    const file = await this.fileStorageService.createPendingFile({
      ...this.workspaceDataExportStorageService.getArchiveResource({
        workspaceId,
        exportId,
      }),
      fileId: exportId,
      size: 0,
      mimeType: 'application/octet-stream',
      settings: { isTemporaryFile: true, toDelete: false },
    });
    const now = Date.now();
    const state: WorkspaceDataExportState = {
      workspaceName: workspace.displayName ?? '',
      tables: await this.findExportableTables(workspaceId),
      partNamesByTable: {},
      rowCountByPart: {},
      completedTableCount: 0,
      startedAt: now,
      heartbeatAt: now,
    };

    await this.workspaceDataExportStateService.set(
      { workspaceId, exportId },
      state,
    );
    await this.workspaceDataExportStepService.enqueue({
      workspaceId,
      exportId,
      cursor: {
        tableIndex: 0,
        lastId: null,
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
          state:
            file.status === FILE_STATUS.PENDING
              ? await this.workspaceDataExportStateService.get({
                  workspaceId,
                  exportId: file.id,
                })
              : undefined,
        }),
      ),
    );
  }

  // Metadata cache, not information_schema: the production catalog is too large to query in time.
  private async findExportableTables(
    workspaceId: string,
  ): Promise<WorkspaceDataExportTable[]> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);
    const fieldsByObjectUniversalIdentifier = new Map<
      string,
      FlatFieldMetadata[]
    >();

    for (const flatFieldMetadata of Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(flatFieldMetadata)) {
        continue;
      }

      const fields =
        fieldsByObjectUniversalIdentifier.get(
          flatFieldMetadata.objectMetadataUniversalIdentifier,
        ) ?? [];

      fields.push(flatFieldMetadata);
      fieldsByObjectUniversalIdentifier.set(
        flatFieldMetadata.objectMetadataUniversalIdentifier,
        fields,
      );
    }

    return Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((flatObjectMetadata) => flatObjectMetadata.isActive)
      .sort((left, right) =>
        left.nameSingular.localeCompare(right.nameSingular),
      )
      .map((flatObjectMetadata) => ({
        nameSingular: flatObjectMetadata.nameSingular,
        labelSingular: flatObjectMetadata.labelSingular,
        tableName: computeObjectTargetTable(flatObjectMetadata),
        columns: this.buildColumns({
          workspaceId,
          flatObjectMetadata,
          flatFieldMetadatas:
            fieldsByObjectUniversalIdentifier.get(
              flatObjectMetadata.universalIdentifier,
            ) ?? [],
        }),
      }))
      .filter((table) => isNonEmptyArray(table.columns));
  }

  private buildColumns({
    workspaceId,
    flatObjectMetadata,
    flatFieldMetadatas,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadatas: FlatFieldMetadata[];
  }): WorkspaceDataExportColumn[] {
    const columnsByName = new Map<string, WorkspaceDataExportColumn>();

    for (const flatFieldMetadata of flatFieldMetadatas) {
      for (const columnDefinition of generateColumnDefinitions({
        flatFieldMetadata,
        flatObjectMetadata,
        workspaceId,
      })) {
        if (
          isDefined(columnDefinition.generatedType) ||
          columnDefinition.type === 'tsvector'
        ) {
          continue;
        }

        columnsByName.set(columnDefinition.name, {
          name: columnDefinition.name,
          isText: columnDefinition.type === 'text',
        });
      }
    }

    const idColumn = columnsByName.get('id');

    if (!isDefined(idColumn)) {
      return [];
    }

    columnsByName.delete('id');

    return [idColumn, ...columnsByName.values()];
  }

  // A worker that died mid-export stops heartbeating; only create() clears such a row.
  private isStale(state: WorkspaceDataExportState | undefined): boolean {
    return (
      !isDefined(state) ||
      Date.now() - state.heartbeatAt > WORKSPACE_DATA_EXPORT_STALE_AFTER_MS
    );
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
      completedObjectCount: state?.completedTableCount ?? null,
      totalObjectCount: state?.tables.length ?? null,
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

    return this.isStale(state)
      ? WorkspaceDataExportStatus.FAILED
      : WorkspaceDataExportStatus.PENDING;
  }
}
