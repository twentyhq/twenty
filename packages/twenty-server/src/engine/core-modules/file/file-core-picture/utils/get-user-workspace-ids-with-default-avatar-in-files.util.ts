import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { extractFileIdFromUrl } from 'src/engine/core-modules/file/files-field/utils/extract-file-id-from-url.util';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

export const getUserWorkspaceIdsWithDefaultAvatarInFiles = ({
  userWorkspaces,
  fileIds,
}: {
  userWorkspaces: Pick<UserWorkspaceEntity, 'id' | 'defaultAvatarUrl'>[];
  fileIds: string[];
}): string[] =>
  userWorkspaces
    .filter((userWorkspace) => {
      if (!isDefined(userWorkspace.defaultAvatarUrl)) {
        return false;
      }

      const defaultAvatarFileId = extractFileIdFromUrl(
        userWorkspace.defaultAvatarUrl,
        FileFolder.CorePicture,
      );

      return (
        isDefined(defaultAvatarFileId) && fileIds.includes(defaultAvatarFileId)
      );
    })
    .map((userWorkspace) => userWorkspace.id);
