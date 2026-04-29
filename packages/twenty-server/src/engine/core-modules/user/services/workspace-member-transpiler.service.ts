import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { extractFileIdFromUrl } from 'src/engine/core-modules/file/files-field/utils/extract-file-id-from-url.util';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type DeletedWorkspaceMemberDTO } from 'src/engine/core-modules/user/dtos/deleted-workspace-member.dto';
import { type WorkspaceMemberDTO } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { fromRoleEntitiesToRoleDtos } from 'src/engine/metadata-modules/role/utils/fromRoleEntityToRoleDto.util';
import {
  type WorkspaceMemberDateFormatEnum,
  type WorkspaceMemberNumberFormatEnum,
  type WorkspaceMemberTimeFormatEnum,
  type WorkspaceMemberWorkspaceEntity,
} from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { FileFolder } from 'twenty-shared/types';

export type ToWorkspaceMemberDtoArgs = {
  workspaceMemberEntity: WorkspaceMemberWorkspaceEntity;
  userWorkspaceRoles: RoleEntity[];
  userWorkspace: UserWorkspaceEntity;
};

@Injectable()
export class WorkspaceMemberTranspiler {
  constructor(private readonly fileUrlService: FileUrlService) {}

  generateSignedAvatarUrl({
    workspaceId,
    workspaceMember,
  }: {
    workspaceMember: Pick<WorkspaceMemberWorkspaceEntity, 'avatarUrl' | 'id'>;
    workspaceId: string;
  }): string {
    if (
      !isDefined(workspaceMember.avatarUrl) ||
      !isNonEmptyString(workspaceMember.avatarUrl)
    ) {
      return '';
    }

    const fileId = extractFileIdFromUrl(
      workspaceMember.avatarUrl,
      FileFolder.CorePicture,
    );

    if (!isDefined(fileId)) {
      return '';
    }

    return this.fileUrlService.signFileByIdUrl({
      fileId,
      workspaceId,
      fileFolder: FileFolder.CorePicture,
    });
  }

  toWorkspaceMemberDto({
    userWorkspace,
    workspaceMemberEntity,
    userWorkspaceRoles,
  }: ToWorkspaceMemberDtoArgs): WorkspaceMemberDTO {
    const {
      avatarUrl: avatarUrlFromEntity,
      id,
      name,
      userEmail,
      colorScheme,
      locale,
      timeFormat,
      timeZone,
      dateFormat,
      calendarStartDay,
      numberFormat,
    } = workspaceMemberEntity;

    const avatarUrl = this.generateSignedAvatarUrl({
      workspaceId: userWorkspace.workspaceId,
      workspaceMember: {
        avatarUrl: avatarUrlFromEntity,
        id,
      },
    });

    const roles = fromRoleEntitiesToRoleDtos(userWorkspaceRoles);

    if (!isDefined(userEmail)) {
      throw new Error(`Workspace member ${id} has no userEmail`);
    }

    return {
      id,
      name,
      userEmail,
      avatarUrl,
      userWorkspaceId: userWorkspace.id,
      colorScheme,
      dateFormat: dateFormat as WorkspaceMemberDateFormatEnum,
      locale,
      timeFormat: timeFormat as WorkspaceMemberTimeFormatEnum,
      timeZone,
      roles,
      calendarStartDay,
      numberFormat: numberFormat as WorkspaceMemberNumberFormatEnum,
    } satisfies WorkspaceMemberDTO;
  }

  toWorkspaceMemberDtos(
    allWorkspaceEntitiesBundles: ToWorkspaceMemberDtoArgs[],
  ) {
    return allWorkspaceEntitiesBundles.map((bundle) =>
      this.toWorkspaceMemberDto(bundle),
    );
  }

  toDeletedWorkspaceMemberDto(
    workspaceMember: WorkspaceMemberWorkspaceEntity,
    userWorkspaceId?: string,
  ): DeletedWorkspaceMemberDTO {
    const {
      avatarUrl: avatarUrlFromEntity,
      id,
      name,
      userEmail,
    } = workspaceMember;

    if (!isDefined(userEmail)) {
      throw new Error(`Workspace member ${id} has no userEmail`);
    }

    const avatarUrl = userWorkspaceId
      ? this.generateSignedAvatarUrl({
          workspaceId: userWorkspaceId,
          workspaceMember: {
            avatarUrl: avatarUrlFromEntity,
            id,
          },
        })
      : null;

    return {
      id,
      name,
      userEmail,
      avatarUrl,
      userWorkspaceId: userWorkspaceId ?? null,
    } satisfies DeletedWorkspaceMemberDTO;
  }

  toDeletedWorkspaceMemberDtos(
    workspaceMembers: WorkspaceMemberWorkspaceEntity[],
    userWorkspaceId?: string,
  ): DeletedWorkspaceMemberDTO[] {
    return workspaceMembers.map((workspaceMember) =>
      this.toDeletedWorkspaceMemberDto(workspaceMember, userWorkspaceId),
    );
  }
}
