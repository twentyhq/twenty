import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';
import { resolveCurrentWorkspaceMemberUserWorkspaceId } from 'src/engine/core-modules/user/utils/resolve-current-workspace-member-user-workspace-id.util';

const USER_ID = 'user-id';
const USER_WORKSPACE_ID = 'user-workspace-id';
const CURRENT_MEMBER_ID = 'current-member-id';
const FORMER_MEMBER_ID = 'former-member-id';

const buildMaps = (
  members: Pick<FlatWorkspaceMember, 'id' | 'userId' | 'deletedAt'>[],
): FlatWorkspaceMemberMaps => ({
  byId: Object.fromEntries(
    members.map((member) => [member.id, member as FlatWorkspaceMember]),
  ),
  idByUserId: { [USER_ID]: CURRENT_MEMBER_ID },
  idByUserWorkspaceId: { [USER_WORKSPACE_ID]: CURRENT_MEMBER_ID },
  userWorkspaceIdByUserId: { [USER_ID]: USER_WORKSPACE_ID },
});

describe('resolveCurrentWorkspaceMemberUserWorkspaceId', () => {
  const flatWorkspaceMemberMaps = buildMaps([
    { id: CURRENT_MEMBER_ID, userId: USER_ID, deletedAt: null },
    { id: FORMER_MEMBER_ID, userId: USER_ID, deletedAt: '2026-10-27' },
  ]);

  it('resolves the membership of the current member', () => {
    expect(
      resolveCurrentWorkspaceMemberUserWorkspaceId({
        workspaceMemberId: CURRENT_MEMBER_ID,
        flatWorkspaceMemberMaps,
      }),
    ).toBe(USER_WORKSPACE_ID);
  });

  it('ignores the member a user left behind before rejoining', () => {
    expect(
      resolveCurrentWorkspaceMemberUserWorkspaceId({
        workspaceMemberId: FORMER_MEMBER_ID,
        flatWorkspaceMemberMaps,
      }),
    ).toBeUndefined();
  });

  it('ignores an unknown member', () => {
    expect(
      resolveCurrentWorkspaceMemberUserWorkspaceId({
        workspaceMemberId: 'unknown-member-id',
        flatWorkspaceMemberMaps,
      }),
    ).toBeUndefined();
  });

  it('ignores a live member the cache no longer maps to its user', () => {
    expect(
      resolveCurrentWorkspaceMemberUserWorkspaceId({
        workspaceMemberId: 'stale-member-id',
        flatWorkspaceMemberMaps: {
          ...flatWorkspaceMemberMaps,
          byId: {
            ...flatWorkspaceMemberMaps.byId,
            'stale-member-id': {
              id: 'stale-member-id',
              userId: USER_ID,
              deletedAt: null,
            } as FlatWorkspaceMember,
          },
        },
      }),
    ).toBeUndefined();
  });
});
