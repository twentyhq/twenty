/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/core-modules/record-share/constants/private-record-column-names.constant';
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
  flatObjectMetadata: FlatObjectMetadata;
}): string =>
  `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier(computeObjectTargetTable(flatObjectMetadata))}`;
