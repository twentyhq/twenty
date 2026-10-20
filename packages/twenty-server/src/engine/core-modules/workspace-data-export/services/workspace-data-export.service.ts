import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import archiver from 'archiver';
import { Readable } from 'stream';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { DataSource, Like, type QueryRunner, type Repository } from 'typeorm';
import { v4 } from 'uuid';

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
import {
  formatWorkspaceDataExportCsvHeader,
  formatWorkspaceDataExportCsvRow,
  type WorkspaceDataExportColumn,
} from 'src/engine/core-modules/workspace-data-export/utils/format-workspace-data-export-csv-row.util';
import { WorkspaceDataExportException } from 'src/engine/core-modules/workspace-data-export/workspace-data-export.exception';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

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

type InformationSchemaColumn = {
  table_name: string;
  column_name: string;
  data_type: string;
  is_generated: string;
};

const TEXT_COLUMN_TYPES = new Set(['text', 'character varying', 'character']);

@Injectable()
export class WorkspaceDataExportService {
  private readonly logger = new Logger(WorkspaceDataExportService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectWorkspaceScopedRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: WorkspaceScopedRepository<ObjectMetadataEntity>,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly fileStorageService: FileStorageService,
    private readonly fileUrlService: FileUrlService,
    @InjectMessageQueue(MessageQueue.workspaceDataExportQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async create(workspaceId: string): Promise<WorkspaceDataExportDTO> {
    await this.findWorkspaceOrThrow(workspaceId);

    const pendingExports = await this.fileRepository.find(workspaceId, {
      where: {
        path: Like(`${FileFolder.WorkspaceDataExport}/%`),
        status: FILE_STATUS.PENDING,
      },
    });

    for (const pendingExport of pendingExports) {
      if (!this.isStale(pendingExport)) {
        throw new WorkspaceDataExportException(
          `An export is already running for workspace ${workspaceId}`,
          'EXPORT_ALREADY_RUNNING',
        );
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

      await this.fileRepository.update(
        workspaceId,
        { id: exportId },
        {
          status: FILE_STATUS.UPLOADED,
          size: sizeInBytes,
          mimeType: WORKSPACE_DATA_EXPORT_MIME_TYPE,
        },
      );
    } catch (error) {
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
    const objectMetadatas = await this.objectMetadataRepository.find(
      workspaceId,
      { where: { isActive: true }, relations: { application: true } },
    );
    const queryRunner = this.dataSource.createQueryRunner();
    const archive = archiver('zip', { zlib: { level: 6 } });
    const exportedObjects: ExportedObject[] = [];

    try {
      const columnsByTableName = await this.findExportableColumnsByTableName({
        queryRunner,
        schemaName,
      });

      for (const objectMetadata of objectMetadatas) {
        const applicationUniversalIdentifier =
          objectMetadata.application?.universalIdentifier;

        if (!isDefined(applicationUniversalIdentifier)) {
          this.logger.warn(
            `Workspace ${workspaceId}: ${objectMetadata.nameSingular} has no application, skipped`,
          );
          continue;
        }

        const tableName = computeObjectTargetTable({
          nameSingular: objectMetadata.nameSingular,
          applicationUniversalIdentifier,
        });
        const columns = columnsByTableName.get(tableName);

        if (!isNonEmptyArray(columns)) {
          this.logger.warn(
            `Workspace ${workspaceId}: ${objectMetadata.nameSingular} has no table ${tableName}, skipped`,
          );
          continue;
        }

        const exportedObject: ExportedObject = {
          nameSingular: objectMetadata.nameSingular,
          labelSingular: objectMetadata.labelSingular,
          file: `${objectMetadata.nameSingular}.csv`,
          rowCount: 0,
        };

        exportedObjects.push(exportedObject);
        archive.append(
          Readable.from(
            this.streamCsv({
              queryRunner,
              schemaName,
              tableName,
              columns,
              abortSignal,
              onRow: () => exportedObject.rowCount++,
            }),
          ),
          { name: exportedObject.file },
        );
      }

      // Archiver drains entries in order, so the manifest sees final row counts.
      archive.append(
        Readable.from(
          (async function* () {
            yield JSON.stringify(
              {
                workspaceId,
                workspaceName: workspace.displayName,
                exportedAt: new Date().toISOString(),
                objects: exportedObjects,
              },
              null,
              2,
            );
          })(),
        ),
        { name: WORKSPACE_DATA_EXPORT_MANIFEST_FILENAME },
      );

      await Promise.all([
        this.fileStorageService.writeFileStream({
          ...this.getFileResource({ workspaceId, exportId }),
          stream: archive,
          mimeType: WORKSPACE_DATA_EXPORT_MIME_TYPE,
        }),
        archive.finalize(),
      ]);

      return archive.pointer();
    } finally {
      await queryRunner.release();
    }
  }

  private async findExportableColumnsByTableName({
    queryRunner,
    schemaName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
  }): Promise<Map<string, WorkspaceDataExportColumn[]>> {
    const rows: InformationSchemaColumn[] = await queryRunner.query(
      `SELECT table_name, column_name, data_type, is_generated
       FROM information_schema.columns
       WHERE table_schema = $1
       ORDER BY table_name, ordinal_position`,
      [schemaName],
    );
    const columnsByTableName = new Map<string, WorkspaceDataExportColumn[]>();

    for (const row of rows) {
      if (row.is_generated === 'ALWAYS' || row.data_type === 'tsvector') {
        continue;
      }

      const columns = columnsByTableName.get(row.table_name) ?? [];

      columns.push({
        name: row.column_name,
        isText: TEXT_COLUMN_TYPES.has(row.data_type),
      });
      columnsByTableName.set(row.table_name, columns);
    }

    return columnsByTableName;
  }

  private async *streamCsv({
    queryRunner,
    schemaName,
    tableName,
    columns,
    abortSignal,
    onRow,
  }: {
    queryRunner: QueryRunner;
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

      const rows: ({ id: string } & Record<string, unknown>)[] =
        await queryRunner.query(
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

  // Removes the object and the row so a new export can start; a worker that
  // died mid-export leaves a PENDING row that only create() can clear.
  private async discard({
    workspaceId,
    file,
  }: {
    workspaceId: string;
    file: FileEntity;
  }): Promise<void> {
    try {
      await this.fileStorageService.deleteFile({
        ...this.getFileResource({ workspaceId, exportId: file.id }),
        applicationId: file.applicationId,
      });
    } catch (error) {
      this.logger.warn(
        `Workspace ${workspaceId}: failed to delete export ${file.id} from storage, dropping its row`,
        error,
      );
      await this.fileRepository.delete(workspaceId, { id: file.id });
      await this.fileStorageService.releaseStorageStock({
        workspaceId,
        applicationId: file.applicationId,
        bytes: Number(file.size),
        quantity: 1,
      });
    }
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
      throw new WorkspaceDataExportException(
        `Workspace ${workspaceId} not found`,
        'WORKSPACE_NOT_FOUND',
      );
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
  }: WorkspaceDataExportJobData) {
    return {
      workspaceId,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      fileFolder: FileFolder.WorkspaceDataExport,
      resourcePath: `${exportId}.zip`,
    };
  }
}
