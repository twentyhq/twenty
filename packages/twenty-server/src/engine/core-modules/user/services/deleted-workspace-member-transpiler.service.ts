import { Injectable } from '@nestjs/common';

import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { DeletedWorkspaceMember } from 'src/engine/core-modules/user/dtos/deleted-workspace-member.dto';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

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
