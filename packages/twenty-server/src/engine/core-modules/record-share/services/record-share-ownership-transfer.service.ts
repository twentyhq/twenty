/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { MemberCustodianService } from 'src/engine/metadata-modules/user-role/services/member-custodian.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class RecordShareOwnershipTransferService {
  constructor(
    private readonly memberCustodianService: MemberCustodianService,
    private readonly recordShareStorageService: RecordShareStorageService,
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
    const custodianUserWorkspace =
      await this.memberCustodianService.resolveCustodianUserWorkspace({
        removedUserWorkspace,
        actingUserWorkspaceId,
      });

    if (!isDefined(custodianUserWorkspace)) {
      return;
    }

    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);
    const toWorkspaceMemberId =
      flatWorkspaceMemberMaps.idByUserId[custodianUserWorkspace.userId];

    if (!isDefined(toWorkspaceMemberId)) {
      return;
    }

    await this.recordShareStorageService.transferMemberGrants({
      workspaceId,
      fromWorkspaceMemberId: removedWorkspaceMemberId,
      toWorkspaceMemberId,
    });
  }
}
