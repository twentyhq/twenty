import { Injectable } from '@nestjs/common';

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { type ShareWithInput } from 'src/engine/core-modules/record-share/types/share-with-input.type';
import { buildRecordShareInputsForCreatedRecords } from 'src/engine/core-modules/record-share/utils/build-record-share-inputs-for-created-records.util';
import { validateShareWithArgOrThrow } from 'src/engine/core-modules/record-share/utils/validate-share-with-arg-or-throw.util';
import { validateShareWithPrincipalsOrThrow } from 'src/engine/core-modules/record-share/utils/validate-share-with-principals-or-throw.util';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ShareWithService {
  constructor(
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async validateShareWithOrThrow({
    authContext,
    isRecordSharingEnabled,
    shareWith,
  }: {
    authContext: WorkspaceAuthContext;
    isRecordSharingEnabled: boolean;
    shareWith?: ShareWithInput[] | null;
  }): Promise<void> {
    validateShareWithArgOrThrow({
      authContext,
      isRecordSharingEnabled,
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
    objectMetadataId,
    recordIds,
    apiKeyRoleMap,
    shareWith,
    isRecordSharingEnabled,
    transactionScope,
  }: {
    authContext: WorkspaceAuthContext;
    objectMetadataId: string;
    recordIds: string[];
    apiKeyRoleMap: Record<string, string>;
    shareWith?: ShareWithInput[] | null;
    transactionScope?: WorkspaceTransactionScope;
    isRecordSharingEnabled: boolean;
  }): Promise<void> {
    const workspaceId = authContext.workspace.id;

    // A hard-destroyed record leaves its rows behind, and a client may reuse its id
    await this.recordShareStorageService.deleteByRecordIds({
      workspaceId,
      objectMetadataId,
      recordIds,
      transactionScope,
    });

    await this.recordShareStorageService.insertMany({
      workspaceId,
      recordShares: buildRecordShareInputsForCreatedRecords({
        recordIds,
        objectMetadataId,
        authContext,
        apiKeyRoleMap,
        shareWith,
        isRecordSharingEnabled,
      }),
      transactionScope,
    });
  }
}
