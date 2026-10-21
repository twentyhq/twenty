import { Injectable, Logger } from '@nestjs/common';

import archiver, { type Archiver } from 'archiver';
import { once } from 'events';
import { type PoolClient } from 'pg';
import { Readable } from 'stream';
import { isDefined } from 'twenty-shared/utils';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  WORKSPACE_DATA_EXPORT_BATCH_SIZE,
  WORKSPACE_DATA_EXPORT_MANIFEST_FILENAME,
  WORKSPACE_DATA_EXPORT_MIME_TYPE,
  WORKSPACE_DATA_EXPORT_PART_MIME_TYPE,
  WORKSPACE_DATA_EXPORT_STEP_JOB_NAME,
  WORKSPACE_DATA_EXPORT_STEP_MAX_ATTEMPTS,
  WORKSPACE_DATA_EXPORT_STEP_MAX_DURATION_MS,
  WORKSPACE_DATA_EXPORT_STEP_MAX_ROWS,
  WORKSPACE_DATA_EXPORT_STEP_RETRY_DELAY_MS,
} from 'src/engine/core-modules/workspace-data-export/constants/workspace-data-export.constant';
import { WorkspaceDataExportStateService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-state.service';
import { WorkspaceDataExportStorageService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-storage.service';
import { type WorkspaceDataExportCursor } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-cursor.type';
import { type WorkspaceDataExportJobData } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-job-data.type';
import { type WorkspaceDataExportState } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-state.type';
import { type WorkspaceDataExportTable } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-table.type';
import { buildNextWorkspaceDataExportCursor } from 'src/engine/core-modules/workspace-data-export/utils/build-next-workspace-data-export-cursor.util';
import { buildWorkspaceDataExportPartName } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-part-name.util';
import { formatWorkspaceDataExportCsvHeader } from 'src/engine/core-modules/workspace-data-export/utils/format-workspace-data-export-csv-header.util';
import { formatWorkspaceDataExportCsvRow } from 'src/engine/core-modules/workspace-data-export/utils/format-workspace-data-export-csv-row.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type PartResult = {
  partName: string;
  rowCount: number;
  lastId: string | null;
  isTableExhausted: boolean;
};

// Each step writes one bounded CSV part and enqueues the next cursor, so a
// worker restart loses at most one part and the export resumes where it was.
@Injectable()
export class WorkspaceDataExportStepService {
  private readonly logger = new Logger(WorkspaceDataExportStepService.name);

  constructor(
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly fileStorageService: FileStorageService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceDataExportStateService: WorkspaceDataExportStateService,
    private readonly workspaceDataExportStorageService: WorkspaceDataExportStorageService,
    @InjectMessageQueue(MessageQueue.workspaceDataExportQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async enqueue(
    jobData: WorkspaceDataExportJobData,
    { delay }: { delay?: number } = {},
  ): Promise<void> {
    const { exportId, cursor } = jobData;

    await this.messageQueueService.add(
      WORKSPACE_DATA_EXPORT_STEP_JOB_NAME,
      jobData,
      { id: `${exportId}:${cursor.stepIndex}:${cursor.attempt}`, delay },
    );
  }

  async runStep(
    { workspaceId, exportId, cursor }: WorkspaceDataExportJobData,
    abortSignal: AbortSignal,
  ): Promise<void> {
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
      if (cursor.tableIndex >= state.tables.length) {
        await this.finalize({ workspaceId, exportId, state });

        return;
      }

      const table = state.tables[cursor.tableIndex];
      const part = await this.writePart({
        workspaceId,
        exportId,
        cursor,
        table,
        abortSignal,
      });
      const partNames = state.partNamesByTable[table.nameSingular] ?? [];

      await this.workspaceDataExportStateService.set(
        { workspaceId, exportId },
        {
          ...state,
          partNamesByTable: {
            ...state.partNamesByTable,
            [table.nameSingular]: partNames.includes(part.partName)
              ? partNames
              : [...partNames, part.partName],
          },
          rowCountByPart: {
            ...state.rowCountByPart,
            [part.partName]: part.rowCount,
          },
          completedTableCount: part.isTableExhausted
            ? cursor.tableIndex + 1
            : state.completedTableCount,
          heartbeatAt: Date.now(),
        },
      );

      await this.enqueue({
        workspaceId,
        exportId,
        cursor: buildNextWorkspaceDataExportCursor({
          cursor,
          lastId: part.lastId,
          isTableExhausted: part.isTableExhausted,
        }),
      });
    } catch (error) {
      if (cursor.attempt + 1 < WORKSPACE_DATA_EXPORT_STEP_MAX_ATTEMPTS) {
        this.logger.warn(
          `Workspace ${workspaceId}: export ${exportId} step ${cursor.stepIndex} failed on attempt ${cursor.attempt + 1}, retrying`,
          error,
        );
        await this.enqueue(
          {
            workspaceId,
            exportId,
            cursor: { ...cursor, attempt: cursor.attempt + 1 },
          },
          { delay: WORKSPACE_DATA_EXPORT_STEP_RETRY_DELAY_MS },
        );

        return;
      }

      this.logger.error(
        `Workspace ${workspaceId}: export ${exportId} failed at step ${cursor.stepIndex}`,
        error,
      );
      await this.workspaceDataExportStorageService.discard({
        workspaceId,
        file,
      });
      throw error;
    }
  }

  private async writePart({
    workspaceId,
    exportId,
    cursor,
    table,
    abortSignal,
  }: {
    workspaceId: string;
    exportId: string;
    cursor: WorkspaceDataExportCursor;
    table: WorkspaceDataExportTable;
    abortSignal: AbortSignal;
  }): Promise<PartResult> {
    const partName = buildWorkspaceDataExportPartName({
      nameSingular: table.nameSingular,
      partIndex: cursor.partIndex,
    });
    const client = await this.workspaceOrmManager
      .getReadPoolOrThrow()
      .connect();
    const result: PartResult = {
      partName,
      rowCount: 0,
      lastId: cursor.lastId,
      isTableExhausted: false,
    };

    try {
      await this.fileStorageService.writeFileStream({
        ...this.workspaceDataExportStorageService.getPartResource({
          workspaceId,
          exportId,
          partName,
        }),
        stream: Readable.from(
          this.streamPartCsv({
            client,
            schemaName: getWorkspaceSchemaName(workspaceId),
            table,
            cursor,
            result,
            abortSignal,
          }),
        ),
        mimeType: WORKSPACE_DATA_EXPORT_PART_MIME_TYPE,
      });
    } finally {
      client.release();
    }

    return result;
  }

  private async *streamPartCsv({
    client,
    schemaName,
    table,
    cursor,
    result,
    abortSignal,
  }: {
    client: PoolClient;
    schemaName: string;
    table: WorkspaceDataExportTable;
    cursor: WorkspaceDataExportCursor;
    result: PartResult;
    abortSignal: AbortSignal;
  }): AsyncGenerator<string> {
    if (cursor.partIndex === 0) {
      yield formatWorkspaceDataExportCsvHeader(table.columns);
    }

    const selectedColumns = table.columns
      .map((column) => escapeIdentifier(column.name))
      .join(', ');
    const qualifiedTable = `${escapeIdentifier(schemaName)}.${escapeIdentifier(table.tableName)}`;
    const startedAt = Date.now();

    while (true) {
      abortSignal.throwIfAborted();

      const { rows } = await client.query<
        { id: string } & Record<string, unknown>
      >(
        isDefined(result.lastId)
          ? `SELECT ${selectedColumns} FROM ${qualifiedTable} WHERE "id" > $1 ORDER BY "id" LIMIT ${WORKSPACE_DATA_EXPORT_BATCH_SIZE}`
          : `SELECT ${selectedColumns} FROM ${qualifiedTable} ORDER BY "id" LIMIT ${WORKSPACE_DATA_EXPORT_BATCH_SIZE}`,
        isDefined(result.lastId) ? [result.lastId] : [],
      );

      for (const row of rows) {
        yield formatWorkspaceDataExportCsvRow({ columns: table.columns, row });
        result.rowCount++;
      }

      if (rows.length > 0) {
        result.lastId = rows[rows.length - 1].id;
      }

      if (rows.length < WORKSPACE_DATA_EXPORT_BATCH_SIZE) {
        result.isTableExhausted = true;

        return;
      }

      if (
        result.rowCount >= WORKSPACE_DATA_EXPORT_STEP_MAX_ROWS ||
        Date.now() - startedAt >= WORKSPACE_DATA_EXPORT_STEP_MAX_DURATION_MS
      ) {
        return;
      }
    }
  }

  // Pure I/O, no database work: rerunning it after an interruption is safe.
  private async finalize({
    workspaceId,
    exportId,
    state,
  }: {
    workspaceId: string;
    exportId: string;
    state: WorkspaceDataExportState;
  }): Promise<void> {
    const archiveResource =
      this.workspaceDataExportStorageService.getArchiveResource({
        workspaceId,
        exportId,
      });
    const archive = archiver('zip', { zlib: { level: 1 } });
    const upload = this.fileStorageService.writeFileStream({
      ...archiveResource,
      stream: archive,
      mimeType: WORKSPACE_DATA_EXPORT_MIME_TYPE,
    });
    const failure = new Promise<never>((_, reject) => {
      archive.once('error', reject);
      upload.catch(reject);
    });

    failure.catch(() => undefined);

    try {
      const exportedObjects = state.tables.map((table) => {
        const partNames = state.partNamesByTable[table.nameSingular] ?? [];

        return {
          nameSingular: table.nameSingular,
          labelSingular: table.labelSingular,
          file: `${table.nameSingular}.csv`,
          rowCount: partNames.reduce(
            (total, partName) => total + (state.rowCountByPart[partName] ?? 0),
            0,
          ),
        };
      });

      for (const table of state.tables) {
        await this.appendEntry({
          archive,
          failure,
          name: `${table.nameSingular}.csv`,
          source: Readable.from(
            this.readParts({
              workspaceId,
              exportId,
              partNames: state.partNamesByTable[table.nameSingular] ?? [],
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
            workspaceName: state.workspaceName,
            exportedAt: new Date().toISOString(),
            objects: exportedObjects,
          },
          null,
          2,
        ),
      });

      await Promise.all([archive.finalize(), upload]);
    } catch (error) {
      // Fails the upload, which otherwise waits on the archive forever.
      archive.destroy(error);
      throw error;
    }

    const { affected } = await this.fileRepository.update(
      workspaceId,
      { id: exportId, status: FILE_STATUS.PENDING },
      {
        status: FILE_STATUS.UPLOADED,
        size: archive.pointer(),
        mimeType: WORKSPACE_DATA_EXPORT_MIME_TYPE,
      },
    );

    // The row was discarded as stale while the archive was being written.
    if (affected === 0) {
      this.logger.warn(
        `Workspace ${workspaceId}: export ${exportId} row is gone, dropping its archive`,
      );
      await this.fileStorageService.deleteFileObject(archiveResource);

      return;
    }

    await this.workspaceDataExportStorageService.deleteParts({
      workspaceId,
      exportId,
    });
    await this.workspaceDataExportStateService.delete({
      workspaceId,
      exportId,
    });
  }

  private async *readParts({
    workspaceId,
    exportId,
    partNames,
  }: {
    workspaceId: string;
    exportId: string;
    partNames: string[];
  }): AsyncGenerator<Buffer> {
    for (const partName of partNames) {
      const stream = await this.fileStorageService.readFile(
        this.workspaceDataExportStorageService.getPartResource({
          workspaceId,
          exportId,
          partName,
        }),
      );

      for await (const chunk of stream) {
        yield chunk;
      }
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
}
