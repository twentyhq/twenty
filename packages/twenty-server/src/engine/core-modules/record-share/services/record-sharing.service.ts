import { buildRecordShareLockKey } from 'src/engine/core-modules/record-share/utils/build-record-share-lock-key.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { Injectable } from '@nestjs/common';

import {
  FeatureFlagKey,
  MetadataReadability,
  type ObjectRecord,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type RecordPermissionsDTO } from 'src/engine/core-modules/record-share/dtos/record-permissions.dto';
import {
  type RecordSharingDTO,
  type RecordSharingTargetInput,
  type RecordSharePrincipalInput,
} from 'src/engine/core-modules/record-share/dtos/record-sharing.dto';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { type RecordShareInput } from 'src/engine/core-modules/record-share/types/record-share-input.type';
import { isRecordShareExceptionObject } from 'src/engine/core-modules/record-share/utils/is-record-share-exception-object.util';
import { isRecordShareableObject } from 'src/engine/core-modules/record-share/utils/is-record-shareable-object.util';
import { resolveRecordGeneralAccess } from 'src/engine/core-modules/record-share/utils/resolve-record-general-access.util';
import { resolveShareWithPrincipalOrThrow } from 'src/engine/core-modules/record-share/utils/resolve-share-with-principal-or-throw.util';
import { resolveViewerRecordShareAccessLevel } from 'src/engine/core-modules/record-share/utils/resolve-viewer-record-share-access-level.util';
import { validateShareWithPrincipalsOrThrow } from 'src/engine/core-modules/record-share/utils/validate-share-with-principals-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { resolvePrincipalIdsFromAuthContext } from 'src/engine/twenty-orm/utils/resolve-principal-ids-from-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type RecordSharingArgs = RecordSharingTargetInput & {
  authContext: UserWorkspaceAuthContext;
  withDeleted?: boolean;
};

const CREATED_BY_FIELD_NAME = 'createdBy';
const CREATED_BY_WORKSPACE_MEMBER_ID_COLUMN_NAME = 'createdByWorkspaceMemberId';

type RecordSharingObject = {
  objectMetadata: FlatObjectMetadata;
  isRecordSharingEnabled: boolean;
  isRecordShareExceptionObject: boolean;
};

@Injectable()
export class RecordSharingService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
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
    const { objectMetadata } = await this.getSharingObject(args);
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository =
        this.workspaceOrmManager.getRepositoryWithContextPermissions(
          objectMetadata.nameSingular,
        );
      const readableIds = await repository.findRecordIdsAllowedForOperation({
        recordIds: args.recordIds,
        operationType: 'select',
        withDeleted: args.withDeleted ?? true,
      });
      const allowed = async (operationType: OperationType) =>
        new Set(
          await repository.findRecordIdsAllowedForOperation({
            recordIds: readableIds,
            operationType,
            withDeleted: args.withDeleted ?? true,
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
    const sharingObject = await this.getSharingObject(args);
    const permissions = await this.getPermissions(args);
    if (!permissions.canRead) {
      throw new NotFoundError('Record not found');
    }
    return this.buildSharingResponse({ args, sharingObject, permissions });
  }

  private async buildSharingResponse({
    args,
    sharingObject,
    permissions,
  }: {
    args: RecordSharingArgs;
    sharingObject: RecordSharingObject;
    permissions: RecordPermissionsDTO;
  }): Promise<RecordSharingDTO> {
    const { objectMetadata, isRecordShareExceptionObject } = sharingObject;
    const { shares, viewerAccessLevel, generalAccess } =
      await this.getRecordShares({ ...args, sharingObject });
    const canChangeSharing =
      permissions.canUpdate &&
      viewerAccessLevel === RecordShareAccessLevel.FULL &&
      (await this.isUpdatePermittedByRole(args, objectMetadata));
    const { flatRoleMaps } = canChangeSharing
      ? await this.workspaceCacheService.getOrRecompute(
          args.authContext.workspace.id,
          ['flatRoleMaps'],
        )
      : { flatRoleMaps: undefined };
    const grants = shares.filter(
      (share) => share.accessLevel !== RecordShareAccessLevel.NONE,
    );
    return {
      permissions,
      viewerAccessLevel,
      isEnabled: this.isShareable(sharingObject),
      hasInheritedAccess:
        objectMetadata.readability === MetadataReadability.INHERITED,
      isOpenByDefault: isRecordShareExceptionObject,
      generalAccessLevel: generalAccess.accessLevel,
      isGeneralAccessDefault: generalAccess.isDefault,
      shares: canChangeSharing ? grants : [],
      roles: isDefined(flatRoleMaps)
        ? Object.values(flatRoleMaps.byUniversalIdentifier)
            .filter(isDefined)
            .filter(
              (role) =>
                role.canBeAssignedToUsers ||
                grants.some(
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
    const sharingObject = await this.getSharingObject(args);
    const { objectMetadata, isRecordShareExceptionObject } = sharingObject;
    const workspaceId = args.authContext.workspace.id;
    if (!this.isShareable(sharingObject)) {
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
                buildRecordShareLockKey({
                  workspaceId,
                  objectMetadataId: args.objectMetadataId,
                  recordId: args.recordId,
                }),
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
                withDeleted: args.withDeleted ?? true,
              });
            // A grant may let someone edit a record beyond their role, never
            // decide who else gets it
            if (
              writableIds.length !== 1 ||
              !repository.isObjectOperationPermittedByRole('update')
            ) {
              throw new NotFoundError('Record not found');
            }
            const { viewerAccessLevel, creatorWorkspaceMemberId } =
              await this.getRecordShares({
                ...args,
                sharingObject,
                transactionScope,
              });
            if (viewerAccessLevel !== RecordShareAccessLevel.FULL) {
              throw new NotFoundError('Record not found');
            }
            if (args.enabled) {
              const maps = await this.workspaceCacheService.getOrRecompute(
                workspaceId,
                ['flatWorkspaceMemberMaps', 'flatRoleMaps'],
              );
              validateShareWithPrincipalsOrThrow({
                shareWith: [shareWith],
                ...maps,
              });
            }
            const share = {
              ...principal,
              objectMetadataId: args.objectMetadataId,
              recordId: args.recordId,
              sourceId: args.recordId,
            };
            if (
              isRecordShareExceptionObject &&
              principal.principalType === RecordSharePrincipalType.EVERYONE
            ) {
              await this.setGeneralAccessOfRecordOpenByDefault({
                workspaceId,
                transactionScope,
                share,
                enabled: args.enabled,
                creatorWorkspaceMemberId,
              });
              return;
            }
            await this.recordShareStorageService.setManualShare({
              workspaceId,
              transactionScope,
              enabled: args.enabled,
              share,
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
        isOpenByDefault: false,
        generalAccessLevel: null,
        isGeneralAccessDefault: true,
        roles: [],
        shares: [],
      };
    }
    return this.buildSharingResponse({ args, sharingObject, permissions });
  }

  // Everyone keeps the general access of a record open by default unless a
  // row lowers it, so restricting writes a row and editing for everyone
  // removes it. The creator owns the record implicitly, and gets a grant once
  // a restriction would otherwise lock them out.
  private async setGeneralAccessOfRecordOpenByDefault({
    workspaceId,
    transactionScope,
    share,
    enabled,
    creatorWorkspaceMemberId,
  }: {
    workspaceId: string;
    transactionScope: WorkspaceTransactionScope;
    share: Omit<RecordShareInput, 'rowCause'>;
    enabled: boolean;
    creatorWorkspaceMemberId: string | undefined;
  }): Promise<void> {
    const accessLevel = enabled
      ? share.accessLevel
      : RecordShareAccessLevel.NONE;
    const isDefaultAccess = accessLevel === RecordShareAccessLevel.READ_WRITE;
    const isRestriction =
      accessLevel === RecordShareAccessLevel.NONE ||
      accessLevel === RecordShareAccessLevel.READ;

    if (isRestriction && isDefined(creatorWorkspaceMemberId)) {
      await this.recordShareStorageService.insertMany({
        workspaceId,
        transactionScope,
        recordShares: [
          {
            recordId: share.recordId,
            objectMetadataId: share.objectMetadataId,
            principalId: creatorWorkspaceMemberId,
            principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
            accessLevel: RecordShareAccessLevel.FULL,
            rowCause: RecordShareRowCause.OWNER,
            sourceId: share.recordId,
          },
        ],
      });
    }

    await this.recordShareStorageService.setManualShare({
      workspaceId,
      transactionScope,
      enabled: !isDefaultAccess,
      share: { ...share, accessLevel },
    });
  }

  private async getRecordShares({
    authContext,
    objectMetadataId,
    recordId,
    sharingObject,
    transactionScope,
  }: RecordSharingArgs & {
    sharingObject: RecordSharingObject;
    transactionScope?: WorkspaceTransactionScope;
  }) {
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
    const generalAccess = resolveRecordGeneralAccess({
      readability: sharingObject.objectMetadata.readability,
      isRecordShareExceptionObject: sharingObject.isRecordShareExceptionObject,
      recordShares: shares,
    });
    const creatorWorkspaceMemberId = sharingObject.isRecordShareExceptionObject
      ? await this.findCreatorWorkspaceMemberId({
          workspaceId,
          objectMetadata: sharingObject.objectMetadata,
          recordId,
        })
      : undefined;
    const viewerAccessLevel = resolveViewerRecordShareAccessLevel({
      recordShares: shares,
      principalIds,
      implicitAccessLevels: sharingObject.isRecordShareExceptionObject
        ? [
            generalAccess.accessLevel,
            creatorWorkspaceMemberId === authContext.workspaceMemberId
              ? RecordShareAccessLevel.FULL
              : null,
          ]
        : [],
    });

    return {
      shares,
      viewerAccessLevel,
      generalAccess,
      creatorWorkspaceMemberId,
    };
  }

  private async findCreatorWorkspaceMemberId({
    workspaceId,
    objectMetadata,
    recordId,
  }: {
    workspaceId: string;
    objectMetadata: FlatObjectMetadata;
    recordId: string;
  }): Promise<string | undefined> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);
    const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      objectMetadata,
    );

    if (!isDefined(fieldIdByName[CREATED_BY_FIELD_NAME])) {
      return undefined;
    }

    const [record] = await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager
          .getRepository(objectMetadata.nameSingular, {
            shouldBypassPermissionChecks: true,
          })
          .createQueryBuilder()
          .select(['id', CREATED_BY_WORKSPACE_MEMBER_ID_COLUMN_NAME])
          .where({ id: recordId })
          .withDeleted()
          .getMany<ObjectRecord>({ noFormatting: true }),
      buildSystemAuthContext(workspaceId),
    );
    const creatorWorkspaceMemberId =
      record?.[CREATED_BY_WORKSPACE_MEMBER_ID_COLUMN_NAME];

    return typeof creatorWorkspaceMemberId === 'string'
      ? creatorWorkspaceMemberId
      : undefined;
  }

  private isShareable({
    objectMetadata,
    isRecordSharingEnabled,
  }: RecordSharingObject): boolean {
    return isRecordShareableObject({
      flatObjectMetadata: objectMetadata,
      isRecordSharingEnabled,
    });
  }

  private isUpdatePermittedByRole(
    { authContext }: RecordSharingArgs,
    objectMetadata: FlatObjectMetadata,
  ): Promise<boolean> {
    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager
          .getRepositoryWithContextPermissions(objectMetadata.nameSingular)
          .isObjectOperationPermittedByRole('update'),
      authContext,
    );
  }

  private async getSharingObject(
    args: Omit<RecordSharingArgs, 'recordId'>,
  ): Promise<RecordSharingObject> {
    const { flatObjectMetadataMaps, featureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(
        args.authContext.workspace.id,
        ['flatObjectMetadataMaps', 'featureFlagsMap'],
      );
    const objectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: args.objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });
    if (!isDefined(objectMetadata)) {
      throw new NotFoundError('Record not found');
    }
    const isRecordSharingEnabled =
      featureFlagsMap[FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED] ?? false;
    return {
      objectMetadata,
      isRecordSharingEnabled,
      isRecordShareExceptionObject:
        isRecordSharingEnabled && isRecordShareExceptionObject(objectMetadata),
    };
  }
}
