import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import archiver, { type Archiver } from 'archiver';
import { once } from 'events';
import { type PoolClient } from 'pg';
import { Readable } from 'stream';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
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
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  GENERATE_WORKSPACE_DATA_EXPORT_JOB_NAME,
  WORKSPACE_DATA_EXPORT_BATCH_SIZE,
  WORKSPACE_DATA_EXPORT_MANIFEST_FILENAME,
  WORKSPACE_DATA_EXPORT_MAX_DURATION_MS,
  WORKSPACE_DATA_EXPORT_MIME_TYPE,
} from 'src/engine/core-modules/workspace-data-export/constants/workspace-data-export.constant';
import { type WorkspaceDataExportDTO } from 'src/engine/core-modules/workspace-data-export/dtos/workspace-data-export.dto';
import { WorkspaceDataExportStatus } from 'src/engine/core-modules/workspace-data-export/enums/workspace-data-export-status.enum';
import { type WorkspaceDataExportColumn } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-column.type';
import { formatWorkspaceDataExportCsvHeader } from 'src/engine/core-modules/workspace-data-export/utils/format-workspace-data-export-csv-header.util';
import { formatWorkspaceDataExportCsvRow } from 'src/engine/core-modules/workspace-data-export/utils/format-workspace-data-export-csv-row.util';
import { WorkspaceDataExportException } from 'src/engine/core-modules/workspace-data-export/workspace-data-export.exception';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceDataSourceService } from 'src/engine/twenty-orm/datasource/workspace-data-source.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/generate-column-definitions.util';

export type WorkspaceDataExportJobData = {
  workspaceId: string;
  exportId: string;
};

type ExportedObject = {
  nameSingular: string;
  labelSingular: string;
  file: string;
  rowCount: number;
};

type ExportableTable = {
  nameSingular: string;
  labelSingular: string;
  tableName: string;
  columns: WorkspaceDataExportColumn[];
};

@Injectable()
export class WorkspaceDataExportService {
  private readonly logger = new Logger(WorkspaceDataExportService.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly fileStorageService: FileStorageService,
    private readonly fileUrlService: FileUrlService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly eventLogEmitterService: EventLogEmitterService,
    @InjectMessageQueue(MessageQueue.workspaceDataExportQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async create({
    workspaceId,
    actorUserId,
  }: {
    workspaceId: string;
    actorUserId: string;
  }): Promise<WorkspaceDataExportDTO> {
    await this.findWorkspaceOrThrow(workspaceId);

    const pendingExports = await this.fileRepository.find(workspaceId, {
      where: {
        path: Like(`${FileFolder.WorkspaceDataExport}/%`),
        status: FILE_STATUS.PENDING,
      },
    });

    for (const pendingExport of pendingExports) {
      if (!this.isStale(pendingExport)) {
        throw new WorkspaceDataExportException({
          message: `An export is already running for workspace ${workspaceId}`,
          code: 'EXPORT_ALREADY_RUNNING',
        });
      }

      await this.discard({ workspaceId, file: pendingExport });
    }

    const exportId = v4();
    const file = await this.fileStorageService.createPendingFile({
      ...this.getFileResource({ workspaceId, exportId }),
      fileId: exportId,
      size: 0,
      mimeType: 'application/octet-stream',
      settings: { isTemporaryFile: true, toDelete: false },
    });

    const jobData: WorkspaceDataExportJobData = { workspaceId, exportId };

    await this.messageQueueService.add(
      GENERATE_WORKSPACE_DATA_EXPORT_JOB_NAME,
      jobData,
      { id: exportId },
    );

    void this.eventLogEmitterService
      .createContext({ workspaceId, userId: actorUserId })
      .insertWorkspaceEvent(WORKSPACE_DATA_EXPORT_REQUESTED_EVENT, {
        exportId,
        actorUserId,
      });

    return this.toDTO({ workspaceId, file });
  }

  async findMany(workspaceId: string): Promise<WorkspaceDataExportDTO[]> {
    const files = await this.fileRepository.find(workspaceId, {
      where: { path: Like(`${FileFolder.WorkspaceDataExport}/%`) },
      order: { createdAt: 'DESC' },
    });

    return Promise.all(files.map((file) => this.toDTO({ workspaceId, file })));
  }

  async generate({
    workspaceId,
    exportId,
    abortSignal,
  }: WorkspaceDataExportJobData & { abortSignal: AbortSignal }): Promise<void> {
    const file = await this.fileRepository.findOne(workspaceId, {
      where: { id: exportId, status: FILE_STATUS.PENDING },
    });

    if (!isDefined(file)) {
      this.logger.warn(
        `Export ${exportId} of workspace ${workspaceId} is no longer pending, skipping`,
      );

      return;
    }

    try {
      const sizeInBytes = await this.writeArchive({
        workspaceId,
        exportId,
        abortSignal,
      });

      const { affected } = await this.fileRepository.update(
        workspaceId,
        { id: exportId, status: FILE_STATUS.PENDING },
        {
          status: FILE_STATUS.UPLOADED,
          size: sizeInBytes,
          mimeType: WORKSPACE_DATA_EXPORT_MIME_TYPE,
        },
      );

      // The row was discarded as stale while the archive was being written.
      if (affected === 0) {
        this.logger.warn(
          `Workspace ${workspaceId}: export ${exportId} row is gone, dropping its archive`,
        );
        await this.fileStorageService.deleteFileObject(
          this.getFileResource({ workspaceId, exportId }),
        );
      }
    } catch (error) {
      this.logger.error(
        `Workspace ${workspaceId}: export ${exportId} failed`,
        error,
      );
      await this.discard({ workspaceId, file });
      throw error;
    }
  }

  private async writeArchive({
    workspaceId,
    exportId,
    abortSignal,
  }: WorkspaceDataExportJobData & {
    abortSignal: AbortSignal;
  }): Promise<number> {
    const workspace = await this.findWorkspaceOrThrow(workspaceId);
    const schemaName = getWorkspaceSchemaName(workspaceId);
    const tables = await this.findExportableTables(workspaceId);
    const client = await this.workspaceDataSourceService
      .getReadPool()
      .connect();
    // CSV compresses well at level 1; the worker CPU matters more than the zip size.
    const archive = archiver('zip', { zlib: { level: 1 } });
    const exportedObjects: ExportedObject[] = [];
    const upload = this.fileStorageService.writeFileStream({
      ...this.getFileResource({ workspaceId, exportId }),
      stream: archive,
      mimeType: WORKSPACE_DATA_EXPORT_MIME_TYPE,
    });
    const failure = new Promise<never>((_, reject) => {
      archive.once('error', reject);
      upload.catch(reject);
    });

    failure.catch(() => undefined);

    try {
      for (const table of tables) {
        const exportedObject: ExportedObject = {
          nameSingular: table.nameSingular,
          labelSingular: table.labelSingular,
          file: `${table.nameSingular}.csv`,
          rowCount: 0,
        };

        exportedObjects.push(exportedObject);
        await this.appendEntry({
          archive,
          failure,
          name: exportedObject.file,
          source: Readable.from(
            this.streamCsv({
              client,
              schemaName,
              tableName: table.tableName,
              columns: table.columns,
              abortSignal,
              onRow: () => exportedObject.rowCount++,
            }),
          ),
        });
      }

      await this.appendEntry({
        archive,
        failure,
        name: WORKSPACE_DATA_EXPORT_MANIFEST_FILENAME,
        source: JSON.stringify(
          {
            workspaceId,
            workspaceName: workspace.displayName,
            exportedAt: new Date().toISOString(),
            objects: exportedObjects,
          },
          null,
          2,
        ),
      });

      await Promise.all([archive.finalize(), upload]);

      return archive.pointer();
    } catch (error) {
      // Fails the upload, which otherwise waits on the archive forever.
      archive.destroy(error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Archiver drains an appended stream immediately, so entries go in one at a time.
  private async appendEntry({
    archive,
    failure,
    name,
    source,
  }: {
    archive: Archiver;
    failure: Promise<never>;
    name: string;
    source: Readable | string;
  }): Promise<void> {
    const entryWritten = once(archive, 'entry');

    if (source instanceof Readable) {
      // Archiver pipes the source through a PassThrough, which drops source errors.
      source.once('error', (error) => archive.destroy(error));
    }

    archive.append(source, { name });
    await Promise.race([entryWritten, failure]);
  }

  // Metadata cache, not information_schema: the production catalog is too large to query in time.
  private async findExportableTables(
    workspaceId: string,
  ): Promise<ExportableTable[]> {
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

  private async *streamCsv({
    client,
    schemaName,
    tableName,
    columns,
    abortSignal,
    onRow,
  }: {
    client: PoolClient;
    schemaName: string;
    tableName: string;
    columns: WorkspaceDataExportColumn[];
    abortSignal: AbortSignal;
    onRow: () => void;
  }): AsyncGenerator<string> {
    yield formatWorkspaceDataExportCsvHeader(columns);

    const selectedColumns = columns
      .map((column) => escapeIdentifier(column.name))
      .join(', ');
    const table = `${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)}`;
    let lastId: string | undefined;

    while (true) {
      abortSignal.throwIfAborted();

      const { rows } = await client.query<
        { id: string } & Record<string, unknown>
      >(
        isDefined(lastId)
          ? `SELECT ${selectedColumns} FROM ${table} WHERE "id" > $1 ORDER BY "id" LIMIT ${WORKSPACE_DATA_EXPORT_BATCH_SIZE}`
          : `SELECT ${selectedColumns} FROM ${table} ORDER BY "id" LIMIT ${WORKSPACE_DATA_EXPORT_BATCH_SIZE}`,
        isDefined(lastId) ? [lastId] : [],
      );

      for (const row of rows) {
        yield formatWorkspaceDataExportCsvRow({ columns, row });
        onRow();
      }

      if (rows.length < WORKSPACE_DATA_EXPORT_BATCH_SIZE) {
        return;
      }

      lastId = rows[rows.length - 1].id;
    }
  }

  // A worker that died mid-export leaves a PENDING row only create() can clear.
  private async discard({
    workspaceId,
    file,
  }: {
    workspaceId: string;
    file: FileEntity;
  }): Promise<void> {
    await this.fileStorageService.deleteFile({
      ...this.getFileResource({ workspaceId, exportId: file.id }),
      applicationId: file.applicationId,
    });
  }

  private isStale(file: FileEntity): boolean {
    return (
      Date.now() - file.createdAt.getTime() >
      WORKSPACE_DATA_EXPORT_MAX_DURATION_MS
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
  }: {
    workspaceId: string;
    file: FileEntity;
  }): Promise<WorkspaceDataExportDTO> {
    const status = this.getStatus(file);

    return {
      id: file.id,
      workspaceId,
      status,
      sizeInBytes: Number(file.size),
      createdAt: file.createdAt,
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

  private getStatus(file: FileEntity): WorkspaceDataExportStatus {
    if (file.status === FILE_STATUS.UPLOADED) {
      return WorkspaceDataExportStatus.COMPLETED;
    }

    return this.isStale(file)
      ? WorkspaceDataExportStatus.FAILED
      : WorkspaceDataExportStatus.PENDING;
  }

  private getFileResource({
    workspaceId,
    exportId,
  }: Pick<WorkspaceDataExportJobData, 'workspaceId' | 'exportId'>) {
    return {
      workspaceId,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      fileFolder: FileFolder.WorkspaceDataExport,
      resourcePath: `${exportId}.zip`,
    };
  }
}
