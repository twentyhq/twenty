/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import {
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { isRecordShareExceptionObject } from 'src/engine/core-modules/record-share/utils/is-record-share-exception-object.util';
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
    const objectMetadataIds =
      await this.findTransferableObjectMetadataIds(workspaceId);

    if (objectMetadataIds.length === 0) {
      return;
    }

    const toWorkspaceMemberId = await this.resolveCustodianWorkspaceMemberId({
      removedUserWorkspace,
      actingUserWorkspaceId,
    });

    if (!isDefined(toWorkspaceMemberId)) {
      await this.recordShareStorageService.deleteMatching({
        workspaceId,
        criteria: [
          {
            objectMetadataId: In(objectMetadataIds),
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
      objectMetadataIds,
      fromWorkspaceMemberId: removedWorkspaceMemberId,
      toWorkspaceMemberId,
    });
  }

  // Only records that access to all records already reaches change hands:
  // private objects such as chats and workflow runs stay with their creator
  private async findTransferableObjectMetadataIds(
    workspaceId: string,
  ): Promise<string[]> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    return Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(isRecordShareExceptionObject)
      .map((flatObjectMetadata) => flatObjectMetadata.id);
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
