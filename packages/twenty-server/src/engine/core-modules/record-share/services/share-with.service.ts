/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';
import { RecordSharePrincipalService } from 'src/engine/core-modules/record-share/services/record-share-principal.service';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { type ShareWithInput } from 'src/engine/core-modules/record-share/types/share-with-input.type';
import { buildRecordShareInputsForCreatedRecords } from 'src/engine/core-modules/record-share/utils/build-record-share-inputs-for-created-records.util';
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

  async insertRecordSharesForCreatedRecords({
    authContext,
    flatObjectMetadata,
    sharingMode,
    isRecordSharingEnabled,
    recordIds,
    apiKeyRoleMap,
    shareWith,
    transactionScope,
  }: {
    authContext: WorkspaceAuthContext;
    flatObjectMetadata: FlatObjectMetadata;
    sharingMode: RecordSharingMode;
    isRecordSharingEnabled: boolean;
    recordIds: string[];
    apiKeyRoleMap: Record<string, string>;
    shareWith: ShareWithInput[];
    transactionScope: WorkspaceTransactionScope;
  }): Promise<void> {
    const workspaceId = authContext.workspace.id;

    // Rows orphaned by destroys from older versions may remain, and a client may reuse a destroyed record's id
    await this.recordShareStorageService.deleteByRecordIds({
      workspaceId,
      objectMetadataId: flatObjectMetadata.id,
      recordIds,
      transactionScope,
    });

    await this.recordShareStorageService.insertMany({
      workspaceId,
      recordShares: buildRecordShareInputsForCreatedRecords({
        recordIds,
        objectMetadataId: flatObjectMetadata.id,
        authContext,
        apiKeyRoleMap,
        shareWith,
        isOpenByDefault: sharingMode === RecordSharingMode.OPEN_BY_DEFAULT,
      }),
      transactionScope,
    });

    await this.recordSharePrincipalService.assertPrincipalsReachRecordsOrThrow({
      workspaceId,
      transactionScope,
      flatObjectMetadata,
      isRecordSharingEnabled,
      principals: shareWith.map(resolveShareWithPrincipalOrThrow),
      recordIds,
    });
  }
}
