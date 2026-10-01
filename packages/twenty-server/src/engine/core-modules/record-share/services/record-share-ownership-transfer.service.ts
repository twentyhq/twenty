/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import {
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

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
    const toWorkspaceMemberId = await this.resolveCustodianWorkspaceMemberId({
      removedUserWorkspace,
      actingUserWorkspaceId,
    });

    if (!isDefined(toWorkspaceMemberId)) {
      await this.recordShareStorageService.deleteMatching({
        workspaceId,
        criteria: [
          {
            principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
            principalId: removedWorkspaceMemberId,
            rowCause: In([
              RecordShareRowCause.OWNER,
              RecordShareRowCause.MANUAL,
            ]),
          },
        ],
      });

      return;
    }

    await this.recordShareStorageService.transferMemberGrants({
      workspaceId,
      fromWorkspaceMemberId: removedWorkspaceMemberId,
      toWorkspaceMemberId,
    });
  }

  private async resolveCustodianWorkspaceMemberId({
    removedUserWorkspace,
    actingUserWorkspaceId,
  }: {
    removedUserWorkspace: UserWorkspaceEntity;
    actingUserWorkspaceId?: string;
  }): Promise<string | undefined> {
    const custodianUserWorkspace =
      await this.memberCustodianService.resolveCustodianUserWorkspace({
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

    return flatWorkspaceMemberMaps.idByUserId[custodianUserWorkspace.userId];
  }
}
