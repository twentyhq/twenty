import { Injectable } from '@nestjs/common';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { WorkspaceMember } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import {
  WorkspaceMemberDateFormatEnum,
  WorkspaceMemberTimeFormatEnum,
  WorkspaceMemberWorkspaceEntity,
} from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class DeletedWorkspaceMemberTranspiler {
  constructor(private readonly fileService: FileService) {}

  generateSignedAvatarUrl({
    workspaceId,
    workspaceMember,
  }: {
    workspaceMember: Pick<WorkspaceMemberWorkspaceEntity, 'avatarUrl' | 'id'>;
    workspaceId: string;
  }): string {
    const avatarUrlToken = this.fileService.encodeFileToken({
      workspaceMemberId: workspaceMember.id,
      workspaceId: workspaceId,
    });

    return `${workspaceMember.avatarUrl}?token=${avatarUrlToken}`;
  }

  toDeletedWorkspaceMemberDto(
    workspaceMember: WorkspaceMemberWorkspaceEntity,
    userWorkspaceId?: string,
  ): WorkspaceMember {
    const {
      avatarUrl: avatarUrlFromEntity,
      colorScheme,
      dateFormat,
      id,
      locale,
      name,
      timeFormat,
      timeZone,
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
      avatarUrl,
      colorScheme,
      dateFormat: dateFormat as WorkspaceMemberDateFormatEnum,
      id,
      locale,
      name,
      timeFormat: timeFormat as WorkspaceMemberTimeFormatEnum,
      timeZone,
      userEmail,
      userWorkspaceId,
    };
  }

  toDeletedWorkspaceMemberDtos(
    workspaceMembers: WorkspaceMemberWorkspaceEntity[],
    userWorkspaceId?: string,
  ): WorkspaceMember[] {
    return workspaceMembers.map((workspaceMember) =>
      this.toDeletedWorkspaceMemberDto(workspaceMember, userWorkspaceId),
    );
  }
}
