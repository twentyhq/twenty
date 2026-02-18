import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { extractFileIdFromUrl } from 'src/engine/core-modules/file/files-field/utils/extract-file-id-from-url.util';
import { type FileService } from 'src/engine/core-modules/file/services/file.service';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class WorkspaceMemberQueryResultGetterHandler
  implements QueryResultGetterHandlerInterface
{
  constructor(
    private readonly fileService: FileService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async handle(
    workspaceMember: WorkspaceMemberWorkspaceEntity,
    workspaceId: string,
  ): Promise<WorkspaceMemberWorkspaceEntity> {
    if (!workspaceMember.id || !workspaceMember?.avatarUrl) {
      return workspaceMember;
    }

    if (
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_CORE_PICTURE_MIGRATED,
        workspaceId,
      )
    ) {
      const fileId = extractFileIdFromUrl(
        workspaceMember.avatarUrl,
        FileFolder.CorePicture,
      );

      if (!isDefined(fileId)) {
        return workspaceMember;
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
