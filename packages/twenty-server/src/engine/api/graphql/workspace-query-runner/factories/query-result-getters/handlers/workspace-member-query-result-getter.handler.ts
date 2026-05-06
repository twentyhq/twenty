import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { type FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { extractFileIdFromUrl } from 'src/engine/core-modules/file/files-field/utils/extract-file-id-from-url.util';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class WorkspaceMemberQueryResultGetterHandler
  implements QueryResultGetterHandlerInterface
{
  constructor(private readonly fileUrlService: FileUrlService) {}

  async handle(
    workspaceMember: WorkspaceMemberWorkspaceEntity,
    workspaceId: string,
  ): Promise<WorkspaceMemberWorkspaceEntity> {
    if (!workspaceMember.id || !workspaceMember?.avatarUrl) {
      return workspaceMember;
    }

    const fileId = extractFileIdFromUrl(
      workspaceMember.avatarUrl,
      FileFolder.CorePicture,
    );

    if (!isDefined(fileId)) {
      return {
        ...workspaceMember,
        avatarUrl: '',
      };
    }

    const signedUrl = this.fileUrlService.signFileByIdUrl({
      fileId,
      workspaceId,
      fileFolder: FileFolder.CorePicture,
    });

    return {
      ...workspaceMember,
      avatarUrl: signedUrl,
    };
  }
}
