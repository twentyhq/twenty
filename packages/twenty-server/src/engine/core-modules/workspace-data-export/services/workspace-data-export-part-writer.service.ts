import { Injectable } from '@nestjs/common';

import { Readable } from 'stream';
import { isDefined } from 'twenty-shared/utils';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { buildSystemAuthContext } from 'src/engine/core-modules/auth/utils/build-system-auth-context.util';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { RecordExportQueryService } from 'src/engine/core-modules/record-export/services/record-export-query.service';
import { type RecordExportQueryContext } from 'src/engine/core-modules/record-export/types/record-export-query-context.type';
import { formatRecordExportHeader } from 'src/engine/core-modules/record-export/utils/format-record-export-header.util';
import { formatRecordExportRow } from 'src/engine/core-modules/record-export/utils/format-record-export-row.util';
import {
  WORKSPACE_DATA_EXPORT_ALL_RECORDS_FILTER,
  WORKSPACE_DATA_EXPORT_STEP_MAX_RECORDS,
} from 'src/engine/core-modules/workspace-data-export/constants/workspace-data-export.constant';
import { type WorkspaceDataExportCursor } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-cursor.type';
import { type WorkspaceDataExportTable } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-table.type';
import { buildWorkspaceDataExportPartName } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-part-name.util';
import { buildWorkspaceDataExportResource } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-resource.util';
import { WorkspaceDataExportException } from 'src/engine/core-modules/workspace-data-export/workspace-data-export.exception';

export type WorkspaceDataExportPart = {
  partName: string;
  recordCount: number;
  after: string | null;
  isTableExhausted: boolean;
};

@Injectable()
export class WorkspaceDataExportPartWriterService {
  constructor(
    private readonly coreEntityCacheService: CoreEntityCacheService,
    private readonly fileStorageService: FileStorageService,
    private readonly recordExportQueryService: RecordExportQueryService,
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
    const workspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      workspaceId,
    );

    if (!isDefined(workspace)) {
      throw new WorkspaceDataExportException({
        message: `Workspace ${workspaceId} not found`,
        code: 'WORKSPACE_NOT_FOUND',
      });
    }

    const context = await this.recordExportQueryService.buildContext({
      parameters: {
        objectMetadataId: table.objectMetadataId,
        fieldMetadataIds: table.fieldMetadataIds,
      },
      authContext: buildSystemAuthContext({ workspace }),
    });
    const part: WorkspaceDataExportPart = {
      partName: buildWorkspaceDataExportPartName({
        nameSingular: table.nameSingular,
        partIndex: cursor.partIndex,
      }),
      recordCount: 0,
      after: cursor.after,
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
          context,
          shouldIncludeHeader: cursor.partIndex === 0,
          part,
          abortSignal,
        }),
      ),
      mimeType: 'text/csv',
    });

    return part;
  }

  private async *streamCsv({
    context,
    shouldIncludeHeader,
    part,
    abortSignal,
  }: {
    context: RecordExportQueryContext;
    shouldIncludeHeader: boolean;
    part: WorkspaceDataExportPart;
    abortSignal?: AbortSignal;
  }): AsyncGenerator<string> {
    if (shouldIncludeHeader) {
      yield formatRecordExportHeader(context.columns);
    }

    while (true) {
      abortSignal?.throwIfAborted();

      const { results } = await this.recordExportQueryService.readPage({
        parameters: { filter: WORKSPACE_DATA_EXPORT_ALL_RECORDS_FILTER },
        context,
        after: part.after ?? undefined,
      });

      for (const record of results.records) {
        yield formatRecordExportRow({ columns: context.columns, record });
        part.recordCount++;
      }

      if (!results.pageInfo.hasNextPage) {
        part.isTableExhausted = true;

        return;
      }

      const endCursor = results.pageInfo.endCursor;

      if (!isDefined(endCursor) || endCursor === part.after) {
        throw new WorkspaceDataExportException({
          message: `Pagination did not advance for ${context.queryRunnerContext.flatObjectMetadata.nameSingular}`,
          code: 'EXPORT_INCOMPLETE',
        });
      }

      part.after = endCursor;

      if (part.recordCount >= WORKSPACE_DATA_EXPORT_STEP_MAX_RECORDS) {
        return;
      }
    }
  }
}
