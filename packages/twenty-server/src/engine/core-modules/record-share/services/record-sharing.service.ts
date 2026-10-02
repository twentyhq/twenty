import { buildRecordShareLockKey } from 'src/engine/core-modules/record-share/utils/build-record-share-lock-key.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  FeatureFlagKey,
  type ObjectRecord,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { GENERAL_RECORD_SHARE_ACCESS_LEVELS } from 'src/engine/core-modules/record-share/constants/general-record-share-access-levels.constant';
import {
  type RecordSharePrincipalInput,
  type RecordSharingDTO,
  type RecordSharingGrantDTO,
  type RecordSharingRoleDTO,
} from 'src/engine/core-modules/record-share/dtos/record-sharing.dto';
import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';
import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/core-modules/record-share/record-share.exception';
import { RecordSharePrincipalService } from 'src/engine/core-modules/record-share/services/record-share-principal.service';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { type RecordShare } from 'src/engine/core-modules/record-share/types/record-share.type';
import { canRolesAccessAllRecords } from 'src/engine/core-modules/record-share/utils/can-roles-access-all-records.util';
import { resolveDefaultGeneralAccessLevel } from 'src/engine/core-modules/record-share/utils/resolve-default-general-access-level.util';
import { resolveRecordGeneralAccessLevel } from 'src/engine/core-modules/record-share/utils/resolve-record-general-access-level.util';
import { resolveRecordSharePrincipalOrThrow } from 'src/engine/core-modules/record-share/utils/resolve-record-share-principal-or-throw.util';
import { resolveRecordSharingMode } from 'src/engine/core-modules/record-share/utils/resolve-record-sharing-mode.util';
import { resolveViewerRecordShareAccessLevel } from 'src/engine/core-modules/record-share/utils/resolve-viewer-record-share-access-level.util';
import { validateShareWithPrincipalsOrThrow } from 'src/engine/core-modules/record-share/utils/validate-share-with-principals-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { DENIED_RECORD_PERMISSIONS } from 'src/engine/metadata-modules/record-permissions/constants/denied-record-permissions.constant';
import { type RecordPermissionsDTO } from 'src/engine/metadata-modules/record-permissions/dtos/record-permissions.dto';
import { type RecordTargetInput } from 'src/engine/metadata-modules/record-permissions/dtos/record-target.input';
import { RecordPermissionsService } from 'src/engine/metadata-modules/record-permissions/services/record-permissions.service';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { resolvePrincipalIdsFromAuthContext } from 'src/engine/twenty-orm/utils/resolve-principal-ids-from-auth-context.util';
import { resolveRoleIdsFromAuthContext } from 'src/engine/twenty-orm/utils/resolve-role-ids-from-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type RecordSharingArgs = RecordTargetInput & {
  authContext: UserWorkspaceAuthContext;
};

type RecordSharingObject = {
  flatObjectMetadata: FlatObjectMetadata;
  isRecordSharingEnabled: boolean;
  sharingMode: RecordSharingMode;
};

type RecordSharingChange = {
  workspaceId: string;
  transactionScope: WorkspaceTransactionScope;
  sharingObject: RecordSharingObject;
  creatorWorkspaceMemberId: string | undefined;
};

const CREATED_BY_FIELD_NAME = 'createdBy';
const CREATED_BY_WORKSPACE_MEMBER_ID_COLUMN_NAME = 'createdByWorkspaceMemberId';

@Injectable()
export class RecordSharingService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly recordSharePrincipalService: RecordSharePrincipalService,
    private readonly recordPermissionsService: RecordPermissionsService,
  ) {}

  async getSharing(args: RecordSharingArgs): Promise<RecordSharingDTO> {
    const sharingObject = await this.getSharingObject(args);
    const permissions = await this.getPermissions({ args, sharingObject });

    if (!permissions.canRead) {
      throw new NotFoundError('Record not found');
    }

    return this.buildSharingResponse({ args, sharingObject, permissions });
  }

  // On a record open by default, the default level means following the
  // object again, so no row is kept for it
  async setGeneralAccess(
    args: RecordSharingArgs & { accessLevel: RecordShareAccessLevel },
  ): Promise<RecordSharingDTO> {
    if (!GENERAL_RECORD_SHARE_ACCESS_LEVELS.includes(args.accessLevel)) {
      throw new RecordShareException(
        `General access level "${args.accessLevel}" must be one of ${GENERAL_RECORD_SHARE_ACCESS_LEVELS.join(', ')}`,
        RecordShareExceptionCode.INVALID_SHARE_WITH,
        { userFriendlyMessage: msg`Invalid access level.` },
      );
    }

    return this.changeSharing(args, (change) =>
      this.writeGeneralAccess({ ...change, args }),
    );
  }

  async setShare(
    args: RecordSharingArgs & {
      principal: RecordSharePrincipalInput;
      accessLevel: RecordShareAccessLevel;
    },
  ): Promise<RecordSharingDTO> {
    const maps = await this.workspaceCacheService.getOrRecompute(
      args.authContext.workspace.id,
      ['flatWorkspaceMemberMaps', 'flatRoleMaps'],
    );
    const [principal] = validateShareWithPrincipalsOrThrow({
      shareWith: [{ ...args.principal, accessLevel: args.accessLevel }],
      ...maps,
    });

    return this.changeSharing(
      args,
      async ({ workspaceId, transactionScope, sharingObject }) => {
        await this.recordShareStorageService.setManualShare({
          workspaceId,
          transactionScope,
          enabled: true,
          share: {
            ...principal,
            objectMetadataId: args.objectMetadataId,
            recordId: args.recordId,
            sourceId: args.recordId,
          },
        });
        await this.recordSharePrincipalService.assertPrincipalsReachRecordsOrThrow(
          {
            workspaceId,
            transactionScope,
            flatObjectMetadata: sharingObject.flatObjectMetadata,
            isRecordSharingEnabled: sharingObject.isRecordSharingEnabled,
            principals: [principal],
            recordIds: [args.recordId],
          },
        );
      },
    );
  }

  async removeShare(
    args: RecordSharingArgs & { principal: RecordSharePrincipalInput },
  ): Promise<RecordSharingDTO> {
    const principal = resolveRecordSharePrincipalOrThrow(args.principal);

    return this.changeSharing(args, ({ workspaceId, transactionScope }) =>
      this.recordShareStorageService.setManualShare({
        workspaceId,
        transactionScope,
        enabled: false,
        share: {
          ...principal,
          accessLevel: RecordShareAccessLevel.READ,
          objectMetadataId: args.objectMetadataId,
          recordId: args.recordId,
          sourceId: args.recordId,
        },
      }),
    );
  }

  private async changeSharing(
    args: RecordSharingArgs,
    write: (change: RecordSharingChange) => Promise<void>,
  ): Promise<RecordSharingDTO> {
    const sharingObject = await this.getSharingObject(args);
    const { flatObjectMetadata, sharingMode } = sharingObject;
    const workspaceId = args.authContext.workspace.id;

    if (sharingMode === RecordSharingMode.ROLE_ONLY) {
      throw new NotFoundError('Record not found');
    }

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
              `SELECT id FROM ${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier(computeObjectTargetTable(flatObjectMetadata))} WHERE id = $1 FOR UPDATE`,
              [args.recordId],
            );
            const repository =
              this.workspaceOrmManager.getRepositoryWithContextPermissions(
                flatObjectMetadata.nameSingular,
                transactionScope,
              );
            const writableIds =
              await repository.findRecordIdsAllowedForOperation({
                recordIds: [args.recordId],
                operationType: 'update',
                withDeleted: true,
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
            await write({
              workspaceId,
              transactionScope,
              sharingObject,
              creatorWorkspaceMemberId,
            });
          },
        ),
      args.authContext,
    );

    const permissions = await this.getPermissions({ args, sharingObject });

    // A writer may revoke their own access; the mutation must still succeed with a redacted state.
    if (!permissions.canRead) {
      return {
        sharingMode,
        canManageSharing: false,
        permissions,
        generalAccessLevel: null,
        defaultGeneralAccessLevel:
          resolveDefaultGeneralAccessLevel(sharingMode),
        hasManagedGeneralAccess: false,
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
  private async writeGeneralAccess({
    workspaceId,
    transactionScope,
    sharingObject: { sharingMode },
    creatorWorkspaceMemberId,
    args,
  }: RecordSharingChange & {
    args: RecordSharingArgs & { accessLevel: RecordShareAccessLevel };
  }): Promise<void> {
    const isDefaultAccess =
      args.accessLevel === resolveDefaultGeneralAccessLevel(sharingMode);

    if (sharingMode === RecordSharingMode.OPEN_BY_DEFAULT) {
      await this.writeOwnersOfRecordOpenByDefault({
        workspaceId,
        transactionScope,
        args,
        isDefaultAccess,
        ownerWorkspaceMemberIds: [
          creatorWorkspaceMemberId,
          args.authContext.workspaceMemberId,
        ],
      });
    }

    await this.recordShareStorageService.setManualShare({
      workspaceId,
      transactionScope,
      enabled: !isDefaultAccess,
      share: {
        principalId: EVERYONE_PRINCIPAL_ID,
        principalType: RecordSharePrincipalType.EVERYONE,
        accessLevel: args.accessLevel,
        objectMetadataId: args.objectMetadataId,
        recordId: args.recordId,
        sourceId: args.recordId,
      },
    });
  }

  // Whoever restricts may only manage the record through the general access
  // they are lowering, so they keep a grant alongside the creator. Owner rows
  // only exist to keep a restriction manageable, so they go once the record
  // follows the default again.
  private async writeOwnersOfRecordOpenByDefault({
    workspaceId,
    transactionScope,
    args,
    isDefaultAccess,
    ownerWorkspaceMemberIds,
  }: {
    workspaceId: string;
    transactionScope: WorkspaceTransactionScope;
    args: RecordSharingArgs & { accessLevel: RecordShareAccessLevel };
    isDefaultAccess: boolean;
    ownerWorkspaceMemberIds: (string | undefined)[];
  }): Promise<void> {
    if (isDefaultAccess) {
      await this.recordShareStorageService.deleteMatching({
        workspaceId,
        transactionScope,
        criteria: [
          {
            objectMetadataId: args.objectMetadataId,
            recordId: args.recordId,
            rowCause: RecordShareRowCause.OWNER,
          },
        ],
      });

      return;
    }

    const isRestriction =
      args.accessLevel === RecordShareAccessLevel.NONE ||
      args.accessLevel === RecordShareAccessLevel.READ;

    if (!isRestriction) {
      return;
    }

    await this.recordShareStorageService.insertMany({
      workspaceId,
      transactionScope,
      recordShares: [...new Set(ownerWorkspaceMemberIds)]
        .filter(isDefined)
        .map((ownerWorkspaceMemberId) => ({
          recordId: args.recordId,
          objectMetadataId: args.objectMetadataId,
          principalId: ownerWorkspaceMemberId,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          accessLevel: RecordShareAccessLevel.FULL,
          rowCause: RecordShareRowCause.OWNER,
          sourceId: args.recordId,
        })),
    });
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
    const { flatObjectMetadata, sharingMode } = sharingObject;
    const { shares, viewerAccessLevel, generalAccessLevel } =
      await this.getRecordShares({ ...args, sharingObject });
    const canManageSharing =
      sharingMode !== RecordSharingMode.ROLE_ONLY &&
      permissions.canUpdate &&
      viewerAccessLevel === RecordShareAccessLevel.FULL &&
      (await this.isUpdatePermittedByRole({
        authContext: args.authContext,
        flatObjectMetadata,
      }));
    const grants = shares.filter(
      (share) =>
        share.principalType !== RecordSharePrincipalType.EVERYONE &&
        share.accessLevel !== RecordShareAccessLevel.NONE,
    );

    return {
      sharingMode,
      canManageSharing,
      permissions,
      generalAccessLevel,
      defaultGeneralAccessLevel: resolveDefaultGeneralAccessLevel(sharingMode),
      hasManagedGeneralAccess: shares.some(
        (share) =>
          share.principalType === RecordSharePrincipalType.EVERYONE &&
          share.rowCause !== RecordShareRowCause.MANUAL &&
          share.accessLevel !== RecordShareAccessLevel.NONE,
      ),
      shares: canManageSharing
        ? await this.buildGrants({
            workspaceId: args.authContext.workspace.id,
            grants,
          })
        : [],
      roles: canManageSharing
        ? await this.buildRoles({
            workspaceId: args.authContext.workspace.id,
            objectMetadataId: flatObjectMetadata.id,
            grants,
          })
        : [],
    };
  }

  private async buildGrants({
    workspaceId,
    grants,
  }: {
    workspaceId: string;
    grants: RecordShare[];
  }): Promise<RecordSharingGrantDTO[]> {
    const roleIds = await this.recordSharePrincipalService.resolveRoleIds({
      workspaceId,
      principals: grants,
    });

    return grants.map((grant, index) => ({
      id: grant.id,
      principalType: grant.principalType,
      principalId: grant.principalId,
      principalRoleId:
        grant.principalType === RecordSharePrincipalType.WORKSPACE_MEMBER
          ? (roleIds[index] ?? null)
          : null,
      accessLevel: grant.accessLevel,
      rowCause: grant.rowCause,
    }));
  }

  private async buildRoles({
    workspaceId,
    objectMetadataId,
    grants,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    grants: RecordShare[];
  }): Promise<RecordSharingRoleDTO[]> {
    const { flatRoleMaps, rolesPermissions } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatRoleMaps',
        'rolesPermissions',
      ]);

    return Object.values(flatRoleMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (role) =>
          role.canBeAssignedToUsers ||
          grants.some(
            (grant) =>
              grant.principalType === RecordSharePrincipalType.ROLE &&
              grant.principalId === role.id,
          ),
      )
      .map(({ id, label }) => {
        const roleObjectsPermissions = rolesPermissions[id];

        if (!isDefined(roleObjectsPermissions)) {
          return { id, label, canRead: null, canUpdate: null };
        }

        const objectPermissions = roleObjectsPermissions[objectMetadataId];

        return {
          id,
          label,
          canRead: objectPermissions?.canReadObjectRecords ?? false,
          canUpdate: objectPermissions?.canUpdateObjectRecords ?? false,
        };
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
    const isOpenByDefault =
      sharingObject.sharingMode === RecordSharingMode.OPEN_BY_DEFAULT;
    const { userWorkspaceRoleMap, apiKeyRoleMap, roleIdsWithAllRecordsAccess } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'userWorkspaceRoleMap',
        'apiKeyRoleMap',
        'roleIdsWithAllRecordsAccess',
      ]);
    const roleMaps = { authContext, userWorkspaceRoleMap, apiKeyRoleMap };
    const principalIds = resolvePrincipalIdsFromAuthContext(roleMaps) ?? [];
    const canAccessAllRecords = canRolesAccessAllRecords({
      roleIds: resolveRoleIdsFromAuthContext(roleMaps),
      roleIdsWithAllRecordsAccess,
    });
    const shares = await this.recordShareStorageService.findByRecordIds({
      workspaceId,
      objectMetadataId,
      recordIds: [recordId],
      transactionScope,
    });
    const generalAccessLevel = resolveRecordGeneralAccessLevel({
      sharingMode: sharingObject.sharingMode,
      recordShares: shares,
    });
    const creatorWorkspaceMemberId = isOpenByDefault
      ? await this.findCreatorWorkspaceMemberId({
          workspaceId,
          flatObjectMetadata: sharingObject.flatObjectMetadata,
          recordId,
        })
      : undefined;
    const viewerAccessLevel = resolveViewerRecordShareAccessLevel({
      recordShares: shares,
      principalIds,
      implicitAccessLevels: isOpenByDefault
        ? [
            generalAccessLevel,
            creatorWorkspaceMemberId === authContext.workspaceMemberId ||
            canAccessAllRecords
              ? RecordShareAccessLevel.FULL
              : null,
          ]
        : [],
    });

    return {
      shares,
      viewerAccessLevel,
      generalAccessLevel,
      creatorWorkspaceMemberId,
    };
  }

  private async findCreatorWorkspaceMemberId({
    workspaceId,
    flatObjectMetadata,
    recordId,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    recordId: string;
  }): Promise<string | undefined> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);
    const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

    if (!isDefined(fieldIdByName[CREATED_BY_FIELD_NAME])) {
      return undefined;
    }

    const [record] = await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager
          .getRepository(flatObjectMetadata.nameSingular, {
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

  private async getPermissions({
    args,
    sharingObject,
  }: {
    args: RecordSharingArgs;
    sharingObject: RecordSharingObject;
  }): Promise<RecordPermissionsDTO> {
    const permissionsByRecordId =
      await this.recordPermissionsService.getPermissionsForRecords({
        authContext: args.authContext,
        flatObjectMetadata: sharingObject.flatObjectMetadata,
        recordIds: [args.recordId],
      });

    return (
      permissionsByRecordId.get(args.recordId) ?? DENIED_RECORD_PERMISSIONS
    );
  }

  private isUpdatePermittedByRole({
    authContext,
    flatObjectMetadata,
  }: Pick<RecordSharingArgs, 'authContext'> & {
    flatObjectMetadata: Pick<FlatObjectMetadata, 'nameSingular'>;
  }): Promise<boolean> {
    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager
          .getRepositoryWithContextPermissions(flatObjectMetadata.nameSingular)
          .isObjectOperationPermittedByRole('update'),
      authContext,
    );
  }

  private async getSharingObject({
    authContext,
    objectMetadataId,
  }: Pick<
    RecordSharingArgs,
    'authContext' | 'objectMetadataId'
  >): Promise<RecordSharingObject> {
    const { flatObjectMetadataMaps, featureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(
        authContext.workspace.id,
        ['flatObjectMetadataMaps', 'featureFlagsMap'],
      );
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      throw new NotFoundError('Record not found');
    }

    const isRecordSharingEnabled =
      featureFlagsMap[FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED] ?? false;

    return {
      flatObjectMetadata,
      isRecordSharingEnabled,
      sharingMode: resolveRecordSharingMode({
        flatObjectMetadata,
        isRecordSharingEnabled,
      }),
    };
  }
}
