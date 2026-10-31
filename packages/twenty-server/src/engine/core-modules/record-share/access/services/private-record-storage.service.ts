/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  CREATED_BY_WORKSPACE_MEMBER_ID_COLUMN_NAME,
  IS_PRIVATE_COLUMN_NAME,
} from 'src/engine/core-modules/record-share/constants/private-record-column-names.constant';
import { type PrivateRecordState } from 'src/engine/core-modules/record-share/access/types/private-record-state.type';
import { buildSelectPrivateRecordStatesSql } from 'src/engine/core-modules/record-share/access/utils/build-select-private-record-states-sql.util';
import { hasCreatedByField } from 'src/engine/core-modules/record-share/utils/has-created-by-field.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const RECORD_SHARE_OBJECT_METADATA_NAME = 'recordShare';

@Injectable()
export class PrivateRecordStorageService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async findStates({
    workspaceId,
    flatObjectMetadata,
    recordIds,
    transactionScope,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    recordIds: string[];
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<Map<string, PrivateRecordState>> {
    if (recordIds.length === 0) {
      return new Map();
    }

    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const rows = await this.withRepository(
      { workspaceId, flatObjectMetadata, transactionScope },
      (repository) =>
        repository.executeRaw<{ id: string } & PrivateRecordState>(
          buildSelectPrivateRecordStatesSql({
            tableExpression: buildTableExpression({
              workspaceId,
              flatObjectMetadata,
            }),
            hasCreatedByField: hasCreatedByField({
              flatObjectMetadata,
              flatFieldMetadataMaps,
            }),
          }),
          { recordIds },
        ),
    );

    return new Map(
      rows.map(({ id, isPrivate, createdByWorkspaceMemberId }) => [
        id,
        { isPrivate, createdByWorkspaceMemberId },
      ]),
    );
  }

  // One statement across every object, so no record id is loaded or bound
  async grantPrivateRecordsCreatedBy({
    workspaceId,
    flatObjectMetadatas,
    creatorWorkspaceMemberId,
    granteeWorkspaceMemberId,
  }: {
    workspaceId: string;
    flatObjectMetadatas: FlatObjectMetadata[];
    creatorWorkspaceMemberId: string;
    granteeWorkspaceMemberId: string;
  }): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);
    const objectsWithCreator = flatObjectMetadatas.filter(
      (flatObjectMetadata) =>
        hasCreatedByField({ flatObjectMetadata, flatFieldMetadataMaps }),
    );

    if (objectsWithCreator.length === 0) {
      return;
    }

    const privateRecordSelects = objectsWithCreator.map(
      (flatObjectMetadata, index) =>
        `SELECT CAST(:objectMetadataId${index} AS uuid) AS "objectMetadataId", "id" AS "recordId" FROM ${buildTableExpression({ workspaceId, flatObjectMetadata })} WHERE ${escapeIdentifier(IS_PRIVATE_COLUMN_NAME)} AND ${escapeIdentifier(CREATED_BY_WORKSPACE_MEMBER_ID_COLUMN_NAME)} = :creatorWorkspaceMemberId`,
    );

    await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager
          .getRepository(RECORD_SHARE_OBJECT_METADATA_NAME, {
            shouldBypassPermissionChecks: true,
          })
          .executeRaw(
            `INSERT INTO ${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}."recordShare"
               ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
             SELECT private_record."objectMetadataId", private_record."recordId", :granteeWorkspaceMemberId, 'WORKSPACE_MEMBER', 'FULL', 'OWNER', private_record."recordId"
             FROM (${privateRecordSelects.join(' UNION ALL ')}) AS private_record
             ON CONFLICT DO NOTHING`,
            {
              creatorWorkspaceMemberId,
              granteeWorkspaceMemberId,
              ...Object.fromEntries(
                objectsWithCreator.map(({ id }, index) => [
                  `objectMetadataId${index}`,
                  id,
                ]),
              ),
            },
          ),
      buildSystemAuthContext(workspaceId),
    );
  }

  // Must share the caller's transaction so the records and their privacy change together
  async setPrivate({
    workspaceId,
    flatObjectMetadata,
    recordIds,
    isPrivate,
    transactionScope,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    recordIds: string[];
    isPrivate: boolean;
    transactionScope: WorkspaceTransactionScope;
  }): Promise<void> {
    if (recordIds.length === 0) {
      return;
    }

    await this.withRepository(
      { workspaceId, flatObjectMetadata, transactionScope },
      (repository) =>
        repository.executeRaw(
          `UPDATE ${buildTableExpression({ workspaceId, flatObjectMetadata })} SET ${escapeIdentifier(IS_PRIVATE_COLUMN_NAME)} = :isPrivate WHERE "id" = ANY(:recordIds)`,
          { isPrivate, recordIds },
        ),
    );
  }

  private async withRepository<TResult>(
    {
      workspaceId,
      flatObjectMetadata,
      transactionScope,
    }: {
      workspaceId: string;
      flatObjectMetadata: FlatObjectMetadata;
      transactionScope?: WorkspaceTransactionScope;
    },
    work: (repository: WorkspaceRepository) => Promise<TResult>,
  ): Promise<TResult> {
    if (isDefined(transactionScope)) {
      return work(
        transactionScope.getRepository(
          flatObjectMetadata.nameSingular,
          { shouldBypassPermissionChecks: true },
          { shouldSkipEventEmission: true },
        ),
      );
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        work(
          this.workspaceOrmManager.getRepository(
            flatObjectMetadata.nameSingular,
            { shouldBypassPermissionChecks: true },
            { shouldSkipEventEmission: true },
          ),
        ),
      buildSystemAuthContext(workspaceId),
    );
  }
}

const buildTableExpression = ({
  workspaceId,
  flatObjectMetadata,
}: {
  workspaceId: string;
  flatObjectMetadata: Parameters<typeof computeObjectTargetTable>[0];
}): string =>
  `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier(computeObjectTargetTable(flatObjectMetadata))}`;
