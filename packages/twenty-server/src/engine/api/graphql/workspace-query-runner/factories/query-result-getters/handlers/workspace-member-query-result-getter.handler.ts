import { QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class WorkspaceMemberQueryResultGetterHandler
  implements QueryResultGetterHandlerInterface
{
  constructor(private readonly fileService: FileService) {}

  async handle(
    workspaceMember: WorkspaceMemberWorkspaceEntity,
    workspaceId: string,
  ): Promise<WorkspaceMemberWorkspaceEntity> {
    if (!workspaceMember.id || !workspaceMember?.avatarUrl) {
      return workspaceMember;
    }

    const signedPayload = await this.fileService.encodeFileToken({
      workspaceMemberId: workspaceMember.id,
      workspaceId: workspaceId,
    });

    return {
      ...workspaceMember,
      avatarUrl: `${workspaceMember.avatarUrl}?token=${signedPayload}`,
    };
  }
}
