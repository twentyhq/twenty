import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';
import { buildFlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/utils/build-flat-workspace-member-maps.util';

const buildWorkspaceMember = ({
  id,
  userId,
  deletedAt = null,
}: {
  id: string;
  userId: string;
  deletedAt?: string | null;
}) => ({ id, userId, deletedAt }) as FlatWorkspaceMember;

describe('buildFlatWorkspaceMemberMaps', () => {
  it('should map each user workspace to the member of its user', () => {
    const memberWithUserWorkspace = buildWorkspaceMember({
      id: 'member-1',
      userId: 'user-1',
    });
    const memberWithoutUserWorkspace = buildWorkspaceMember({
      id: 'member-2',
      userId: 'user-2',
    });

    expect(
      buildFlatWorkspaceMemberMaps({
        workspaceMembers: [memberWithUserWorkspace, memberWithoutUserWorkspace],
        userWorkspaces: [
          { id: 'user-workspace-1', userId: 'user-1' },
          { id: 'user-workspace-3', userId: 'user-3' },
        ],
      }),
    ).toEqual({
      byId: {
        'member-1': memberWithUserWorkspace,
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

  it.each(['before', 'after'])(
    'should resolve a rejoined user to the live member when the deleted one comes %s it',
    (deletedMemberPosition) => {
      const deletedMember = buildWorkspaceMember({
        id: 'member-deleted',
        userId: 'user-1',
        deletedAt: '2026-09-01T00:00:00.000Z',
      });
      const liveMember = buildWorkspaceMember({
        id: 'member-live',
        userId: 'user-1',
      });

      const flatWorkspaceMemberMaps = buildFlatWorkspaceMemberMaps({
        workspaceMembers:
          deletedMemberPosition === 'before'
            ? [deletedMember, liveMember]
            : [liveMember, deletedMember],
        userWorkspaces: [{ id: 'user-workspace-1', userId: 'user-1' }],
      });

      expect(flatWorkspaceMemberMaps.byId).toEqual({
        'member-deleted': deletedMember,
        'member-live': liveMember,
      });
      expect(flatWorkspaceMemberMaps.idByUserId).toEqual({
        'user-1': 'member-live',
      });
      expect(flatWorkspaceMemberMaps.idByUserWorkspaceId).toEqual({
        'user-workspace-1': 'member-live',
      });
    },
  );

  it('should not map a user workspace to a member who left', () => {
    const flatWorkspaceMemberMaps = buildFlatWorkspaceMemberMaps({
      workspaceMembers: [
        buildWorkspaceMember({
          id: 'member-1',
          userId: 'user-1',
          deletedAt: '2026-09-01T00:00:00.000Z',
        }),
      ],
      userWorkspaces: [{ id: 'user-workspace-1', userId: 'user-1' }],
    });

    expect(flatWorkspaceMemberMaps.idByUserId).toEqual({
      'user-1': 'member-1',
    });
    expect(flatWorkspaceMemberMaps.idByUserWorkspaceId).toEqual({});
    expect(flatWorkspaceMemberMaps.userWorkspaceIdByUserId).toEqual({
      'user-1': 'user-workspace-1',
    });
  });
});
