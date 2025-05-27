import { buildSignedPath } from 'twenty-shared/utils';

import { QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { extractFilenameFromPath } from 'src/engine/core-modules/file/utils/extract-file-id-from-path.utils';

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

    const signedPayload = this.fileService.encodeFileToken({
      filename: extractFilenameFromPath(workspaceMember.avatarUrl),
      workspaceId,
    });

    return {
      ...workspaceMember,
      avatarUrl: buildSignedPath({
        path: workspaceMember.avatarUrl,
        token: signedPayload,
      }),
    };
  }
}
