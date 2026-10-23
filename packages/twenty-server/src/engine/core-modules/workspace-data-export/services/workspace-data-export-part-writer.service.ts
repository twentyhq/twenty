import { Injectable } from '@nestjs/common';

import { Readable } from 'stream';
import { type ObjectRecord } from 'twenty-shared/types';
import {
  formatRecordExportHeader,
  formatRecordExportRow,
  isDefined,
} from 'twenty-shared/utils';
import { MoreThan } from 'typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { buildSystemAuthContext } from 'src/engine/core-modules/auth/utils/build-system-auth-context.util';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { RECORD_EXPORT_PAGE_SIZE } from 'src/engine/core-modules/record-export/constants/record-export.constants';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WORKSPACE_DATA_EXPORT_PART_MAX_SIZE_IN_BYTES } from 'src/engine/core-modules/workspace-data-export/constants/workspace-data-export.constant';
import { type WorkspaceDataExportCursor } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-cursor.type';
import { type WorkspaceDataExportObject } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-object.type';
import { buildWorkspaceDataExportPartName } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-part-name.util';
import { buildWorkspaceDataExportResource } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-resource.util';
import { WorkspaceDataExportException } from 'src/engine/core-modules/workspace-data-export/workspace-data-export.exception';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type WorkspaceDataExportPart = {
  partName: string;
  recordCount: number;
  after: string | null;
  isLastPart: boolean;
};

@Injectable()
export class WorkspaceDataExportPartWriterService {
  constructor(
    private readonly coreEntityCacheService: CoreEntityCacheService,
    private readonly fileStorageService: FileStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async writePart({
    workspaceId,
    exportId,
    cursor,
    object,
    abortSignal,
  }: {
    workspaceId: string;
    exportId: string;
    cursor: WorkspaceDataExportCursor;
    object: WorkspaceDataExportObject;
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

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    const isObjectStillDefined = isDefined(
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: object.objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      }),
    );
    const authContext = buildSystemAuthContext({ workspace });
    const lines = [formatRecordExportHeader(object.columns)];
    let size = Buffer.byteLength(lines[0]);
    let recordCount = 0;
    let after = cursor.after;
    let isLastPart = !isObjectStillDefined;

    while (!isLastPart && size < WORKSPACE_DATA_EXPORT_PART_MAX_SIZE_IN_BYTES) {
      abortSignal?.throwIfAborted();

      const records = await this.readRecords({ object, authContext, after });

      for (const record of records) {
        const line = formatRecordExportRow({ columns: object.columns, record });

        lines.push(line);
        size += Buffer.byteLength(line);
      }

      const lastRecord = records[records.length - 1];

      if (isDefined(lastRecord)) {
        after = lastRecord.id;
      }

      recordCount += records.length;
      isLastPart = records.length < RECORD_EXPORT_PAGE_SIZE;
    }

    const partName = buildWorkspaceDataExportPartName({
      nameSingular: object.nameSingular,
      partIndex: cursor.partIndex,
    });

    await this.fileStorageService.writeFileStream({
      ...buildWorkspaceDataExportResource({
        workspaceId,
        exportId,
        file: { type: 'part', partName },
      }),
      stream: Readable.from([lines.join('')]),
      mimeType: 'text/csv',
    });

    return { partName, recordCount, after, isLastPart };
  }

  private async readRecords({
    object,
    authContext,
    after,
  }: {
    object: Pick<WorkspaceDataExportObject, 'nameSingular'>;
    authContext: WorkspaceAuthContext;
    after: string | null;
  }): Promise<ObjectRecord[]> {
    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager
          .getRepository<ObjectRecord>(
            object.nameSingular,
            { shouldBypassPermissionChecks: true },
            { useReplica: true },
          )
          .find({
            where: isDefined(after) ? { id: MoreThan(after) } : {},
            order: { id: 'ASC' },
            take: RECORD_EXPORT_PAGE_SIZE,
            withDeleted: true,
          }),
      authContext,
    );
  }
}
