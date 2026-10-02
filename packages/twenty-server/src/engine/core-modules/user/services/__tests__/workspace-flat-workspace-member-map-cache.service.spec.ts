import { WorkspaceFlatWorkspaceMemberMapCacheService } from 'src/engine/core-modules/user/services/workspace-flat-workspace-member-map-cache.service';

describe('WorkspaceFlatWorkspaceMemberMapCacheService', () => {
  it('maps each user workspace to the workspace member of its user', async () => {
    const memberOfUser = { id: 'member-1', userId: 'user-1' };
    const memberWithoutUserWorkspace = { id: 'member-2', userId: 'user-2' };
    const workspaceOrmManager = {
      executeInWorkspaceContext: (callback: () => unknown) => callback(),
      getRepository: () => ({
        find: jest
          .fn()
          .mockResolvedValue([memberOfUser, memberWithoutUserWorkspace]),
      }),
    };

    const flatWorkspaceMemberMaps =
      await new WorkspaceFlatWorkspaceMemberMapCacheService(
        workspaceOrmManager as never,
      ).computeForCache({
        workspaceId: 'workspace',
        rows: {
          userWorkspace: [
            { id: 'user-workspace-1', userId: 'user-1' },
            { id: 'user-workspace-3', userId: 'user-3' },
          ],
        },
      });

    expect(flatWorkspaceMemberMaps).toEqual({
      byId: {
        'member-1': memberOfUser,
        'member-2': memberWithoutUserWorkspace,
      },
      idByUserId: { 'user-1': 'member-1', 'user-2': 'member-2' },
      idByUserWorkspaceId: { 'user-workspace-1': 'member-1' },
      userWorkspaceIdByUserId: {
        'user-1': 'user-workspace-1',
        'user-3': 'user-workspace-3',
      },
    });
  });
});
