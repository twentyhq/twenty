/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { resolveObjectSharing } from 'src/engine/core-modules/record-share/utils/resolve-object-sharing.util';
import { PrivateRecordStorageService } from 'src/engine/core-modules/record-share/services/private-record-storage.service';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { ADD_PRIVATE_RECORD_COLUMN_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-55/add-private-record-column-upgrade-command-name.constant';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class RecordShareOwnershipTransferService {
  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly privateRecordStorageService: PrivateRecordStorageService,
    private readonly upgradeMigrationService: UpgradeMigrationService,
    private readonly upgradeSequenceReaderService: UpgradeSequenceReaderService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  // Records a departing member could manage would otherwise only stay
  // manageable through roles with access to all records. Every path that
  // removes a member from a workspace that stays active must call this.
  async transferRecordSharesToCustodian({
    removedUserWorkspace,
    removedWorkspaceMemberId,
    actingUserWorkspaceId,
  }: {
    removedUserWorkspace: UserWorkspaceEntity;
    removedWorkspaceMemberId: string;
    actingUserWorkspaceId?: string;
  }): Promise<void> {
    const { workspaceId } = removedUserWorkspace;
    const transferableObjects = await this.findTransferableObjects(workspaceId);

    if (transferableObjects.length === 0) {
      return;
    }

    const toWorkspaceMemberId = await this.resolveCustodianWorkspaceMemberId({
      removedUserWorkspace,
      actingUserWorkspaceId,
    });

    await this.recordShareStorageService.transferMemberGrants({
      workspaceId,
      objectMetadataIds: transferableObjects.map(({ id }) => id),
      fromWorkspaceMemberId: removedWorkspaceMemberId,
      toWorkspaceMemberId,
    });

    if (
      isDefined(toWorkspaceMemberId) &&
      (await this.hasRunPrivateRecordColumnUpgrade(workspaceId))
    ) {
      // Nobody passes the creator check of a removed member's private records, admins included
      await this.privateRecordStorageService.grantPrivateRecordsCreatedBy({
        workspaceId,
        flatObjectMetadatas: transferableObjects,
        creatorWorkspaceMemberId: removedWorkspaceMemberId,
        granteeWorkspaceMemberId: toWorkspaceMemberId,
      });
    }
  }

  // Remove once 2.55 leaves the cross-upgrade window: before that command a workspace has no private records
  private async hasRunPrivateRecordColumnUpgrade(
    workspaceId: string,
  ): Promise<boolean> {
    const sequence = this.upgradeSequenceReaderService.getUpgradeSequence();
    const commandIndex = sequence.findIndex(
      ({ name }) => name === ADD_PRIVATE_RECORD_COLUMN_UPGRADE_COMMAND_NAME,
    );

    if (commandIndex === -1) {
      return true;
    }

    const cursor = (
      await this.upgradeMigrationService.getWorkspaceLastAttemptedCommandName([
        workspaceId,
      ])
    ).get(workspaceId);

    if (!isDefined(cursor)) {
      return false;
    }

    const cursorIndex = sequence.findIndex(({ name }) => name === cursor.name);

    return (
      cursorIndex > commandIndex ||
      (cursorIndex === commandIndex && cursor.status === 'completed')
    );
  }

  private async findTransferableObjects(
    workspaceId: string,
  ): Promise<FlatObjectMetadata[]> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    return (
      Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        // Rows written while sharing was enabled still need a custodian
        .filter((flatObjectMetadata) => {
          const { isShareable, isShareRequired } = resolveObjectSharing({
            flatObjectMetadata,
            featureFlagsMap: {
              [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: true,
            },
          });

          return isShareable && !isShareRequired;
        })
    );
  }

  private async resolveCustodianWorkspaceMemberId({
    removedUserWorkspace,
    actingUserWorkspaceId,
  }: {
    removedUserWorkspace: UserWorkspaceEntity;
    actingUserWorkspaceId?: string;
  }): Promise<string | undefined> {
    const custodianUserWorkspace =
      await this.userRoleService.resolveCustodianUserWorkspace({
        removedUserWorkspace,
        actingUserWorkspaceId,
      });

    if (!isDefined(custodianUserWorkspace)) {
      return undefined;
    }

    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(
        removedUserWorkspace.workspaceId,
        ['flatWorkspaceMemberMaps'],
      );

    // The cache keeps soft-deleted members, so idByUserId may point at one
    const custodianWorkspaceMember = Object.values(
      flatWorkspaceMemberMaps.byId,
    ).find(
      (workspaceMember) =>
        isDefined(workspaceMember) &&
        workspaceMember.userId === custodianUserWorkspace.userId &&
        !isDefined(workspaceMember.deletedAt),
    );

    return custodianWorkspaceMember?.id;
  }
}
