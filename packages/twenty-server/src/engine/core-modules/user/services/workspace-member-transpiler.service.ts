import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { DeletedWorkspaceMember } from 'src/engine/core-modules/user/dtos/deleted-workspace-member.dto';
import { WorkspaceMember } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { fromRoleEntitiesToRoleDtos } from 'src/engine/metadata-modules/role/utils/fromRoleEntityToRoleDto.util';
import {
  WorkspaceMemberDateFormatEnum,
  WorkspaceMemberTimeFormatEnum,
  WorkspaceMemberWorkspaceEntity,
} from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export type ToWorkspaceMemberDtoArgs = {
  workspaceMemberEntity: WorkspaceMemberWorkspaceEntity;
  userWorkspaceRoles: RoleEntity[];
  userWorkspace: UserWorkspace;
};

@Injectable()
export class WorkspaceMemberTranspiler {
  constructor(private readonly fileService: FileService) {}

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

    return this.fileService.signFileUrl({
      url: workspaceMember.avatarUrl,
      workspaceId,
    });
  }

  toWorkspaceMemberDto({
    userWorkspace,
    workspaceMemberEntity,
    userWorkspaceRoles,
  }: ToWorkspaceMemberDtoArgs): WorkspaceMember {
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
    } = workspaceMemberEntity;

    const avatarUrl = this.generateSignedAvatarUrl({
      workspaceId: userWorkspace.workspaceId,
      workspaceMember: {
        avatarUrl: avatarUrlFromEntity,
        id,
      },
    });

    const roles = fromRoleEntitiesToRoleDtos(userWorkspaceRoles);

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
    } satisfies WorkspaceMember;
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
  ): DeletedWorkspaceMember {
    const {
      avatarUrl: avatarUrlFromEntity,
      id,
      name,
      userEmail,
    } = workspaceMember;

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
    } satisfies DeletedWorkspaceMember;
  }

  toDeletedWorkspaceMemberDtos(
    workspaceMembers: WorkspaceMemberWorkspaceEntity[],
    userWorkspaceId?: string,
  ): DeletedWorkspaceMember[] {
    return workspaceMembers.map((workspaceMember) =>
      this.toDeletedWorkspaceMemberDto(workspaceMember, userWorkspaceId),
    );
  }
}
