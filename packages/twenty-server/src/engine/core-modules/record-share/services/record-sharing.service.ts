import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { Injectable } from '@nestjs/common';

import {
  MetadataReadability,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type RecordPermissionsDTO } from 'src/engine/core-modules/record-share/dtos/record-permissions.dto';
import {
  type RecordSharingDTO,
  type RecordSharingTargetInput,
  type RecordSharePrincipalInput,
} from 'src/engine/core-modules/record-share/dtos/record-sharing.dto';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { RecordSharingFeatureService } from 'src/engine/core-modules/record-share/services/record-sharing-feature.service';
import { resolveShareWithPrincipalOrThrow } from 'src/engine/core-modules/record-share/utils/resolve-share-with-principal-or-throw.util';
import { validateShareWithPrincipalsOrThrow } from 'src/engine/core-modules/record-share/utils/validate-share-with-principals-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { resolvePrincipalIdsFromAuthContext } from 'src/engine/twenty-orm/utils/resolve-principal-ids-from-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type RecordSharingArgs = RecordSharingTargetInput & {
  authContext: UserWorkspaceAuthContext;
  withDeleted?: boolean;
};

@Injectable()
export class RecordSharingService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly featureService: RecordSharingFeatureService,
  ) {}

  async getPermissions(args: RecordSharingArgs): Promise<RecordPermissionsDTO> {
    const permissions = await this.getPermissionsForRecords({
      ...args,
      recordIds: [args.recordId],
    });
    return permissions.get(args.recordId)!;
  }

  async getPermissionsForRecords(
    args: Omit<RecordSharingArgs, 'recordId'> & { recordIds: string[] },
  ): Promise<Map<string, RecordPermissionsDTO>> {
    const objectMetadata = await this.getObjectMetadata(args);
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository =
        this.workspaceOrmManager.getRepositoryWithContextPermissions(
          objectMetadata.nameSingular,
        );
      const readableIds = await repository.findRecordIdsAllowedForOperation({
        recordIds: args.recordIds,
        operationType: 'select',
        withDeleted: args.withDeleted,
      });
      const allowed = async (operationType: OperationType) =>
        new Set(
          await repository.findRecordIdsAllowedForOperation({
            recordIds: readableIds,
            operationType,
            withDeleted: args.withDeleted,
          }),
        );
      const [writableIds, deletableIds, softDeletableIds] = await Promise.all([
        allowed('update'),
        allowed('delete'),
        allowed('soft-delete'),
      ]);
      const readableIdSet = new Set(readableIds);
      return new Map(
        args.recordIds.map((id) => [
          id,
          {
            canRead: readableIdSet.has(id),
            canUpdate: writableIds.has(id),
            canDelete: deletableIds.has(id),
            canSoftDelete: softDeletableIds.has(id),
          },
        ]),
      );
    }, args.authContext);
  }

  async getSharing(args: RecordSharingArgs): Promise<RecordSharingDTO> {
    const objectMetadata = await this.getObjectMetadata(args);
    const permissions = await this.getPermissions(args);
    if (!permissions.canRead) {
      throw new NotFoundError('Record not found');
    }
    const isEnabled =
      this.isShareable(objectMetadata) &&
      (await this.featureService.isRecordSharingEnabled(
        args.authContext.workspace.id,
      ));
    const { shares, viewerAccessLevel } = await this.getRecordShares(args);
    const canChangeSharing =
      permissions.canUpdate &&
      viewerAccessLevel === RecordShareAccessLevel.FULL;
    const { flatRoleMaps } = canChangeSharing
      ? await this.workspaceCacheService.getOrRecompute(
          args.authContext.workspace.id,
          ['flatRoleMaps'],
        )
      : { flatRoleMaps: undefined };
    return {
      permissions,
      viewerAccessLevel,
      isEnabled,
      hasInheritedAccess:
        objectMetadata.readability === MetadataReadability.INHERITED,
      shares: canChangeSharing ? shares : [],
      roles: isDefined(flatRoleMaps)
        ? Object.values(flatRoleMaps.byUniversalIdentifier)
            .filter(isDefined)
            .filter(
              (role) =>
                role.canBeAssignedToUsers ||
                shares.some(
                  (share) =>
                    share.principalType === RecordSharePrincipalType.ROLE &&
                    share.principalId === role.id,
                ),
            )
            .map(({ id, label }) => ({ id, label }))
        : [],
    };
  }

  async setShare(
    args: RecordSharingArgs & {
      principal: RecordSharePrincipalInput;
      accessLevel: RecordShareAccessLevel;
      enabled: boolean;
    },
  ): Promise<RecordSharingDTO> {
    const objectMetadata = await this.getObjectMetadata(args);
    const workspaceId = args.authContext.workspace.id;
    if (!this.isShareable(objectMetadata)) {
      throw new NotFoundError('Record not found');
    }
    const shareWith = { ...args.principal, accessLevel: args.accessLevel };
    const principal = resolveShareWithPrincipalOrThrow(shareWith);
    await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager.runInWorkspaceTransaction(
          async (transactionScope) => {
            await transactionScope.executeRawQuery(
              'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
              [
                `record-share:${workspaceId}:${args.objectMetadataId}:${args.recordId}`,
              ],
            );
            // Lock the target as well as its grants, so deletion cannot leave an orphan grant.
            await transactionScope.executeRawQuery(
              `SELECT id FROM ${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier(computeObjectTargetTable(objectMetadata))} WHERE id = $1 FOR UPDATE`,
              [args.recordId],
            );
            const repository =
              this.workspaceOrmManager.getRepositoryWithContextPermissions(
                objectMetadata.nameSingular,
                transactionScope,
              );
            const writableIds =
              await repository.findRecordIdsAllowedForOperation({
                recordIds: [args.recordId],
                operationType: 'update',
              });
            if (writableIds.length !== 1) {
              throw new NotFoundError('Record not found');
            }
            const { viewerAccessLevel } = await this.getRecordShares({
              ...args,
              transactionScope,
            });
            if (viewerAccessLevel !== RecordShareAccessLevel.FULL) {
              throw new NotFoundError('Record not found');
            }
            if (args.enabled) {
              if (
                !(await this.featureService.isRecordSharingEnabled(workspaceId))
              ) {
                throw new UserInputError(
                  'Sharing is unavailable for this workspace',
                );
              }
              const maps = await this.workspaceCacheService.getOrRecompute(
                workspaceId,
                ['flatWorkspaceMemberMaps', 'flatRoleMaps'],
              );
              validateShareWithPrincipalsOrThrow({
                shareWith: [shareWith],
                ...maps,
              });
            }
            await this.recordShareStorageService.setManualShare({
              workspaceId,
              transactionScope,
              enabled: args.enabled,
              share: {
                ...principal,
                objectMetadataId: args.objectMetadataId,
                recordId: args.recordId,
                sourceId: args.recordId,
              },
            });
          },
        ),
      args.authContext,
    );
    // A writer may revoke the grant that allowed their own access. The saved
    // mutation must still succeed, returning a redacted state after revocation.
    const permissions = await this.getPermissions(args);
    if (!permissions.canRead) {
      return {
        permissions,
        viewerAccessLevel: null,
        isEnabled: false,
        hasInheritedAccess: false,
        roles: [],
        shares: [],
      };
    }
    return this.getSharing(args);
  }

  private async getRecordShares({
    authContext,
    objectMetadataId,
    recordId,
    transactionScope,
  }: RecordSharingArgs & { transactionScope?: WorkspaceTransactionScope }) {
    const workspaceId = authContext.workspace.id;
    const { userWorkspaceRoleMap, apiKeyRoleMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'userWorkspaceRoleMap',
        'apiKeyRoleMap',
      ]);
    const principalIds =
      resolvePrincipalIdsFromAuthContext({
        authContext,
        userWorkspaceRoleMap,
        apiKeyRoleMap,
      }) ?? [];
    const shares = await this.recordShareStorageService.findByRecordIds({
      workspaceId,
      objectMetadataId,
      recordIds: [recordId],
      transactionScope,
    });
    const viewerAccessLevel =
      [
        RecordShareAccessLevel.FULL,
        RecordShareAccessLevel.READ_WRITE,
        RecordShareAccessLevel.READ,
      ].find((accessLevel) =>
        shares.some(
          (share) =>
            principalIds.includes(share.principalId) &&
            share.accessLevel === accessLevel,
        ),
      ) ?? null;

    return { shares, viewerAccessLevel };
  }

  private isShareable(objectMetadata: FlatObjectMetadata): boolean {
    return (
      objectMetadata.readability === MetadataReadability.PRIVATE ||
      objectMetadata.readability === MetadataReadability.INHERITED
    );
  }

  private async getObjectMetadata(
    args: Omit<RecordSharingArgs, 'recordId'>,
  ): Promise<FlatObjectMetadata> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(
        args.authContext.workspace.id,
        ['flatObjectMetadataMaps'],
      );
    const objectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: args.objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });
    if (!isDefined(objectMetadata)) {
      throw new NotFoundError('Record not found');
    }
    return objectMetadata;
  }
}
