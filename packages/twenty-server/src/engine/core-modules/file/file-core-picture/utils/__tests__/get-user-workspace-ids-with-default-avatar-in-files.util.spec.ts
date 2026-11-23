import { getUserWorkspaceIdsWithDefaultAvatarInFiles } from 'src/engine/core-modules/file/file-core-picture/utils/get-user-workspace-ids-with-default-avatar-in-files.util';

describe('getUserWorkspaceIdsWithDefaultAvatarInFiles', () => {
  const deletedFileId = '20202020-0000-4000-8000-000000000001';
  const otherFileId = '20202020-0000-4000-8000-000000000002';

  it('should return the user workspaces whose default avatar is a deleted file', () => {
    expect(
      getUserWorkspaceIdsWithDefaultAvatarInFiles({
        userWorkspaces: [
          {
            id: 'pointing-to-deleted-file',
            defaultAvatarUrl: `https://api.twenty.com/file/core-picture/${deletedFileId}`,
          },
          {
            id: 'pointing-to-other-file',
            defaultAvatarUrl: `https://api.twenty.com/file/core-picture/${otherFileId}`,
          },
          {
            id: 'external-avatar',
            defaultAvatarUrl: `https://lh3.googleusercontent.com/${deletedFileId}`,
          },
          { id: 'no-avatar', defaultAvatarUrl: null },
        ],
        fileIds: [deletedFileId],
      }),
    ).toEqual(['pointing-to-deleted-file']);
  });
});
