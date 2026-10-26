import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import {
  RecordShareAccessLevel,
  type RecordPermissionAction,
} from 'twenty-shared/types';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/core-modules/record-share/record-share.exception';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';
import { RecordSharePrincipalService } from 'src/engine/core-modules/record-share/services/record-share-principal.service';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { type ShareWithInput } from 'src/engine/core-modules/record-share/types/share-with-input.type';
import { buildRecordShareInputsForCreatedRecords } from 'src/engine/core-modules/record-share/utils/build-record-share-inputs-for-created-records.util';
import { type ObjectSharing } from 'src/engine/core-modules/record-share/utils/resolve-object-sharing.util';
import { resolveShareWithPrincipalOrThrow } from 'src/engine/core-modules/record-share/utils/resolve-share-with-principal-or-throw.util';
import { validateShareWithArgOrThrow } from 'src/engine/core-modules/record-share/utils/validate-share-with-arg-or-throw.util';
import { validateShareWithPrincipalsOrThrow } from 'src/engine/core-modules/record-share/utils/validate-share-with-principals-or-throw.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ShareWithService {
  constructor(
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly recordSharePrincipalService: RecordSharePrincipalService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async validateShareWithOrThrow({
    authContext,
    shareWith,
  }: {
    authContext: WorkspaceAuthContext;
    shareWith?: ShareWithInput[] | null;
  }): Promise<void> {
    validateShareWithArgOrThrow({
      authContext,
      shareWith,
    });

    if (!isNonEmptyArray(shareWith)) {
      return;
    }

    const { flatWorkspaceMemberMaps, flatRoleMaps } =
      await this.workspaceCacheService.getOrRecompute(
        authContext.workspace.id,
        ['flatWorkspaceMemberMaps', 'flatRoleMaps'],
      );

    validateShareWithPrincipalsOrThrow({
      shareWith,
      flatWorkspaceMemberMaps,
      flatRoleMaps,
    });
  }

  async prepareRecordPermissionSharing({
    transactionScope,
    workspaceId,
    repository,
  }: {
    transactionScope: WorkspaceTransactionScope;
    workspaceId: string;
    repository: WorkspaceRepository;
  }): Promise<void> {
    await transactionScope.executeRawQuery(
      'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
      [getWorkspaceSchemaName(workspaceId) + ':record-permissions'],
    );
    await repository.refreshRecordPermissionContext();
  }

  async insertRecordSharesForCreatedRecords({
    authContext,
    flatObjectMetadata,
    objectSharing,
    recordIds,
    apiKeyRoleMap,
    shareWith,
    transactionScope,
  }: {
    authContext: WorkspaceAuthContext;
    flatObjectMetadata: FlatObjectMetadata;
    objectSharing: ObjectSharing;
    recordIds: string[];
    apiKeyRoleMap: Record<string, string>;
    shareWith: ShareWithInput[];
    transactionScope: WorkspaceTransactionScope;
  }): Promise<void> {
    const workspaceId = authContext.workspace.id;
    const usesRecordPermissionPolicy = Boolean(
      getWorkspaceContext().recordPermissionContext,
    );

    // A hard-destroyed record leaves its rows behind, and a client may reuse its id
    await this.recordShareStorageService.deleteByRecordIds({
      workspaceId,
      objectMetadataId: flatObjectMetadata.id,
      recordIds,
      transactionScope,
    });

    if (
      usesRecordPermissionPolicy &&
      isNonEmptyArray(shareWith) &&
      (isUserAuthContext(authContext) || isApiKeyAuthContext(authContext))
    ) {
      const repository = transactionScope.getRepository(
        flatObjectMetadata.nameSingular,
      );
      for (const accessLevel of new Set(
        shareWith.map((share) => share.accessLevel),
      )) {
        if (accessLevel === RecordShareAccessLevel.NONE) continue;
        const actions: RecordPermissionAction[] = ['share', 'read'];
        if (
          accessLevel === RecordShareAccessLevel.READ_WRITE ||
          accessLevel === RecordShareAccessLevel.FULL
        )
          actions.push('update');
        if (accessLevel === RecordShareAccessLevel.FULL)
          actions.push('softDelete', 'destroy');
        for (const action of actions) {
          const allowed =
            await repository.findRecordIdsAllowedForRecordPermissionAction({
              recordIds,
              action,
              delegatedAccessLevel:
                action === 'share' ? accessLevel : undefined,
            });
          if (!isDefined(allowed) || allowed.length !== recordIds.length)
            throw new RecordShareException(
              'Cannot delegate access that the grantor does not hold',
              RecordShareExceptionCode.INVALID_SHARE_WITH,
            );
        }
      }
    }

    await this.recordShareStorageService.insertMany({
      workspaceId,
      recordShares: buildRecordShareInputsForCreatedRecords({
        shouldGrantCreatorAccess: !usesRecordPermissionPolicy,
        recordIds,
        objectMetadataId: flatObjectMetadata.id,
        authContext,
        apiKeyRoleMap,
        shareWith,
        isOpenByDefault:
          objectSharing.sharingMode === RecordSharingMode.OPEN_BY_DEFAULT,
      }),
      transactionScope,
    });

    if (!usesRecordPermissionPolicy)
      await this.recordSharePrincipalService.assertPrincipalsReachRecordsOrThrow(
        {
          workspaceId,
          transactionScope,
          flatObjectMetadata,
          canShareBeyondRole: objectSharing.canShareBeyondRole,
          principals: shareWith.map(resolveShareWithPrincipalOrThrow),
          recordIds,
        },
      );
  }
}
