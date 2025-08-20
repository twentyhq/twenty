import { type QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { type FileService } from 'src/engine/core-modules/file/services/file.service';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

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

    const signedPath = this.fileService.signFileUrl({
      url: workspaceMember.avatarUrl,
      workspaceId,
    });

    return {
      ...workspaceMember,
      avatarUrl: signedPath,
    };
  }
}
