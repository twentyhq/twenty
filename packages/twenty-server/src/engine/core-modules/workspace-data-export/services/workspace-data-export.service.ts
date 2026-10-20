import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { t } from '@lingui/core/macro';
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
  WORKSPACE_DATA_EXPORT_BATCH_SIZE,
  WORKSPACE_DATA_EXPORT_MANIFEST_FILENAME,
  WORKSPACE_DATA_EXPORT_MIME_TYPE,
} from 'src/engine/core-modules/workspace-data-export/constants/workspace-data-export.constants';
import { type WorkspaceDataExportDTO } from 'src/engine/core-modules/workspace-data-export/dtos/workspace-data-export.dto';
import { WorkspaceDataExportStatus } from 'src/engine/core-modules/workspace-data-export/enums/workspace-data-export-status.enum';
import { GenerateWorkspaceDataExportJob } from 'src/engine/core-modules/workspace-data-export/jobs/generate-workspace-data-export.job';
import {
  formatWorkspaceDataExportCsvHeader,
  formatWorkspaceDataExportCsvRow,
  type WorkspaceDataExportColumn,
} from 'src/engine/core-modules/workspace-data-export/utils/format-workspace-data-export-csv-row.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
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
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async create(workspaceId: string): Promise<WorkspaceDataExportDTO> {
    await this.findWorkspaceOrThrow(workspaceId);

    const pendingExport = await this.fileRepository.findOne(workspaceId, {
      where: {
        path: Like(`${FileFolder.WorkspaceDataExport}/%`),
        status: FILE_STATUS.PENDING,
      },
    });

    if (isDefined(pendingExport)) {
      throw new ConflictException(
        t`An export is already running for this workspace.`,
      );
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
      GenerateWorkspaceDataExportJob.name,
      jobData,
      { id: exportId },
    );

    return this.toDTO(file);
  }

  async findMany(workspaceId: string): Promise<WorkspaceDataExportDTO[]> {
    const files = await this.fileRepository.find(workspaceId, {
      where: { path: Like(`${FileFolder.WorkspaceDataExport}/%`) },
      order: { createdAt: 'DESC' },
    });

    return Promise.all(files.map((file) => this.toDTO(file)));
  }

  async generate(
    { workspaceId, exportId }: WorkspaceDataExportJobData,
    abortSignal: AbortSignal,
  ): Promise<void> {
    const file = await this.fileRepository.findOne(workspaceId, {
      where: { id: exportId, status: FILE_STATUS.PENDING },
    });

    if (!isDefined(file)) {
      this.logger.warn(`Export ${exportId} is no longer pending, skipping`);

      return;
    }

    const resource = this.getFileResource({ workspaceId, exportId });

    try {
      const sizeInBytes = await this.writeArchive(
        { workspaceId, exportId },
        abortSignal,
      );

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
      await this.fileStorageService
        .deleteFile({ ...resource, applicationId: file.applicationId })
        .catch(() =>
          this.logger.warn(`Failed to remove partial export ${exportId}`),
        );
      throw error;
    }
  }

  private async writeArchive(
    { workspaceId, exportId }: WorkspaceDataExportJobData,
    abortSignal: AbortSignal,
  ): Promise<number> {
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
      for (const objectMetadata of objectMetadatas) {
        const tableName = computeTableName(
          objectMetadata.nameSingular,
          objectMetadata.application?.universalIdentifier !==
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        );
        const columns = await this.findExportableColumns(
          queryRunner,
          schemaName,
          tableName,
        );

        if (!isNonEmptyArray(columns)) {
          this.logger.warn(`${objectMetadata.nameSingular}: no table, skipped`);
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

  private async findExportableColumns(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
  ): Promise<WorkspaceDataExportColumn[]> {
    const rows: {
      column_name: string;
      data_type: string;
      is_generated: string;
    }[] = await queryRunner.query(
      `SELECT column_name, data_type, is_generated
         FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = $2
         ORDER BY ordinal_position`,
      [schemaName, tableName],
    );

    return rows
      .filter(
        (row) => row.is_generated !== 'ALWAYS' && row.data_type !== 'tsvector',
      )
      .map((row) => ({
        name: row.column_name,
        isText: TEXT_COLUMN_TYPES.has(row.data_type),
      }));
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

      const rows: Record<string, unknown>[] = await queryRunner.query(
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

      lastId = rows[rows.length - 1].id as string;
    }
  }

  private async findWorkspaceOrThrow(
    workspaceId: string,
  ): Promise<WorkspaceEntity> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!isDefined(workspace)) {
      throw new NotFoundException(t`Workspace not found.`);
    }

    return workspace;
  }

  private async toDTO(file: FileEntity): Promise<WorkspaceDataExportDTO> {
    const isCompleted = file.status === FILE_STATUS.UPLOADED;

    return {
      id: file.id,
      workspaceId: file.workspaceId as string,
      status: isCompleted
        ? WorkspaceDataExportStatus.COMPLETED
        : WorkspaceDataExportStatus.PENDING,
      sizeInBytes: Number(file.size),
      createdAt: file.createdAt,
      downloadUrl: isCompleted
        ? await this.fileUrlService.signFileByIdUrl({
            fileId: file.id,
            workspaceId: file.workspaceId as string,
            fileFolder: FileFolder.WorkspaceDataExport,
          })
        : null,
    };
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
