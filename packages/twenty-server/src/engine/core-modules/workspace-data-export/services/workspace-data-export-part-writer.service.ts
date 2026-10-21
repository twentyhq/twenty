import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { Readable } from 'stream';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import {
  WORKSPACE_DATA_EXPORT_BATCH_SIZE,
  WORKSPACE_DATA_EXPORT_STEP_MAX_ROWS,
} from 'src/engine/core-modules/workspace-data-export/constants/workspace-data-export.constant';
import { type WorkspaceDataExportCursor } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-cursor.type';
import { type WorkspaceDataExportTable } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-table.type';
import { buildWorkspaceDataExportPartName } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-part-name.util';
import { buildWorkspaceDataExportResource } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-resource.util';
import { formatWorkspaceDataExportCsvHeader } from 'src/engine/core-modules/workspace-data-export/utils/format-workspace-data-export-csv-header.util';
import { formatWorkspaceDataExportCsvRow } from 'src/engine/core-modules/workspace-data-export/utils/format-workspace-data-export-csv-row.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type WorkspaceDataExportPart = {
  partName: string;
  recordCount: number;
  lastId: string | null;
  isTableExhausted: boolean;
};

@Injectable()
export class WorkspaceDataExportPartWriterService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async writePart({
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
    abortSignal?: AbortSignal;
  }): Promise<WorkspaceDataExportPart> {
    const part: WorkspaceDataExportPart = {
      partName: buildWorkspaceDataExportPartName({
        nameSingular: table.nameSingular,
        partIndex: cursor.partIndex,
      }),
      recordCount: 0,
      lastId: cursor.lastId,
      isTableExhausted: false,
    };

    await this.fileStorageService.writeFileStream({
      ...buildWorkspaceDataExportResource({
        workspaceId,
        exportId,
        file: { type: 'part', partName: part.partName },
      }),
      stream: Readable.from(
        this.streamCsv({
          schemaName: getWorkspaceSchemaName(workspaceId),
          table,
          includeHeader: cursor.partIndex === 0,
          part,
          abortSignal,
        }),
      ),
      mimeType: 'text/csv',
    });

    return part;
  }

  private async *streamCsv({
    schemaName,
    table,
    includeHeader,
    part,
    abortSignal,
  }: {
    schemaName: string;
    table: WorkspaceDataExportTable;
    includeHeader: boolean;
    part: WorkspaceDataExportPart;
    abortSignal?: AbortSignal;
  }): AsyncGenerator<string> {
    if (includeHeader) {
      yield formatWorkspaceDataExportCsvHeader(table.columns);
    }

    const selectedColumns = table.columns
      .map((column) => escapeIdentifier(column.name))
      .join(', ');
    const qualifiedTable = `${escapeIdentifier(schemaName)}.${escapeIdentifier(table.tableName)}`;

    while (true) {
      abortSignal?.throwIfAborted();

      const rows: ({ id: string } & Record<string, unknown>)[] =
        await this.dataSource.query(
          isDefined(part.lastId)
            ? `SELECT ${selectedColumns} FROM ${qualifiedTable} WHERE "id" > $1 ORDER BY "id" LIMIT ${WORKSPACE_DATA_EXPORT_BATCH_SIZE}`
            : `SELECT ${selectedColumns} FROM ${qualifiedTable} ORDER BY "id" LIMIT ${WORKSPACE_DATA_EXPORT_BATCH_SIZE}`,
          isDefined(part.lastId) ? [part.lastId] : [],
        );

      for (const row of rows) {
        yield formatWorkspaceDataExportCsvRow({ columns: table.columns, row });
        part.recordCount++;
      }

      if (rows.length > 0) {
        part.lastId = rows[rows.length - 1].id;
      }

      if (rows.length < WORKSPACE_DATA_EXPORT_BATCH_SIZE) {
        part.isTableExhausted = true;

        return;
      }

      if (part.recordCount >= WORKSPACE_DATA_EXPORT_STEP_MAX_ROWS) {
        return;
      }
    }
  }
}
