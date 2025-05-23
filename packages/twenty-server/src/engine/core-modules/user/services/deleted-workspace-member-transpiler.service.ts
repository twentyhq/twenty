import { Injectable } from '@nestjs/common';

import { buildSignedPath } from 'twenty-shared/utils';

import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { DeletedWorkspaceMember } from 'src/engine/core-modules/user/dtos/deleted-workspace-member.dto';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { extractFileIdFromPath } from 'src/engine/core-modules/file/utils/extract-file-id-from-path.utils';

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
    const signedPayload = this.fileService.encodeFileToken({
      fileId: extractFileIdFromPath(workspaceMember.avatarUrl),
      workspaceId,
    });

    return buildSignedPath({
      path: workspaceMember.avatarUrl,
      token: signedPayload,
    });
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
