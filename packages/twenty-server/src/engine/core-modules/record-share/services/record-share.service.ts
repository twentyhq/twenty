import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In, type EntityManager } from 'typeorm';
import {
  RecordShareAccessLevel,
  RecordShareRowCause,
} from 'twenty-shared/types';

import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/core-modules/record-share/record-share.exception';
import { type RecordShareInput } from 'src/engine/core-modules/record-share/types/record-share-input.type';
import { type RecordShare } from 'src/engine/core-modules/record-share/types/record-share.type';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const RECORD_SHARE_OBJECT_METADATA_NAME = 'recordShare';

type RecordShareRepository = WorkspaceRepository<RecordShare>;

@Injectable()
export class RecordShareService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  async findManualReadRecordIdsByPrincipals({
    workspaceId,
    objectMetadataId,
    principalIds,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    principalIds: string[];
  }): Promise<string[]> {
    if (principalIds.length === 0) {
      return [];
    }

    const records = await this.withRepository({ workspaceId }, (repository) =>
      repository
        .createQueryBuilder('recordShare')
        .select('recordShare.recordId', 'recordId')
        .distinctOn(['recordShare.recordId'])
        .where({
          objectMetadataId,
          principalId: In(principalIds),
          rowCause: RecordShareRowCause.MANUAL,
          accessLevel: RecordShareAccessLevel.READ,
        })
        .andWhere('"recordShare"."sourceId" = "recordShare"."recordId"')
        .getRawMany<{ recordId: string }>(),
    );
    return records.map(({ recordId }) => recordId);
  }

  // Callers must authorize management of the target record before using this
  // system repository. Other sources (including ownership) are never removed.
  async setManualShare({
    workspaceId,
    share,
    enabled,
  }: {
    workspaceId: string;
    share: Omit<RecordShareInput, 'rowCause'>;
    enabled: boolean;
  }): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager.runInWorkspaceTransaction(async (scope) => {
          await scope.executeRawQuery(
            'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
            [
              `record-share:${workspaceId}:${share.objectMetadataId}:${share.recordId}`,
            ],
          );
          await this.withRepository(
            { workspaceId, transactionScope: scope },
            async (repository) => {
              await repository.delete({
                objectMetadataId: share.objectMetadataId,
                recordId: share.recordId,
                principalId: share.principalId,
                principalType: share.principalType,
                rowCause: RecordShareRowCause.MANUAL,
                sourceId: share.sourceId,
              });
              if (enabled) {
                await repository.insert({
                  ...share,
                  rowCause: RecordShareRowCause.MANUAL,
                });
              }
            },
          );
        }),
      buildSystemAuthContext(workspaceId),
    );
  }

  async insertMany({
    workspaceId,
    recordShares,
    transactionScope,
  }: {
    workspaceId: string;
    recordShares: RecordShareInput[];
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<void> {
    if (recordShares.length === 0) {
      return;
    }

    await this.withRepository({ workspaceId, transactionScope }, (repository) =>
      repository.insert(recordShares, { onConflictDoNothing: true }),
    );
  }

  async deleteByRecordIds({
    workspaceId,
    objectMetadataId,
    recordIds,
    transactionScope,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    recordIds: string[];
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<void> {
    if (recordIds.length === 0) {
      return;
    }

    await this.withRepository({ workspaceId, transactionScope }, (repository) =>
      repository.delete({ objectMetadataId, recordId: In(recordIds) }),
    );
  }

  async deleteByRecordIdsInTransaction({
    workspaceId,
    objectMetadataId,
    recordIds,
    manager,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    recordIds: string[];
    manager: EntityManager;
  }): Promise<void> {
    if (recordIds.length === 0) {
      return;
    }
    // History transactions can span core and workspace tables and must reuse
    // their existing connection rather than open a separate ORM transaction.
    await manager.query(
      `DELETE FROM ${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier(RECORD_SHARE_OBJECT_METADATA_NAME)} WHERE "objectMetadataId" = $1 AND "recordId" = ANY($2::uuid[])`,
      [objectMetadataId, recordIds],
    );
  }

  async deleteBySourceId({
    workspaceId,
    sourceId,
    transactionScope,
  }: {
    workspaceId: string;
    sourceId: string;
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<void> {
    await this.withRepository({ workspaceId, transactionScope }, (repository) =>
      repository.delete({ sourceId }),
    );
  }

  async findByRecordIds({
    workspaceId,
    objectMetadataId,
    recordIds,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    recordIds: string[];
  }): Promise<RecordShare[]> {
    if (recordIds.length === 0) {
      return [];
    }

    return this.withRepository({ workspaceId }, (repository) =>
      repository.find({
        where: { objectMetadataId, recordId: In(recordIds) },
      }),
    );
  }

  private async withRepository<TResult>(
    {
      workspaceId,
      transactionScope,
    }: {
      workspaceId: string;
      transactionScope?: WorkspaceTransactionScope;
    },
    work: (repository: RecordShareRepository) => Promise<TResult>,
  ): Promise<TResult> {
    if (isDefined(transactionScope)) {
      if (transactionScope.workspaceId !== workspaceId) {
        throw new RecordShareException(
          `Transaction scope of workspace ${transactionScope.workspaceId} cannot write record shares of workspace ${workspaceId}`,
          RecordShareExceptionCode.TRANSACTION_SCOPE_WORKSPACE_MISMATCH,
        );
      }

      return work(
        transactionScope.getRepository<RecordShare>(
          RECORD_SHARE_OBJECT_METADATA_NAME,
          { shouldBypassPermissionChecks: true },
          { shouldSkipEventEmission: true },
        ),
      );
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        work(
          this.workspaceOrmManager.getRepository<RecordShare>(
            RECORD_SHARE_OBJECT_METADATA_NAME,
            { shouldBypassPermissionChecks: true },
            { shouldSkipEventEmission: true },
          ),
        ),
      buildSystemAuthContext(workspaceId),
    );
  }
}
