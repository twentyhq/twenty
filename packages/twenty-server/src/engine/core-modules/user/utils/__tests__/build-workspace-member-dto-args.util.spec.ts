import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { buildWorkspaceMemberDtoArgs } from 'src/engine/core-modules/user/utils/build-workspace-member-dto-args.util';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const activeMember = {
  id: 'member-active',
  userId: 'user-active',
} as WorkspaceMemberWorkspaceEntity;

const halfRemovedMember = {
  id: 'member-half-removed',
  userId: 'user-half-removed',
} as WorkspaceMemberWorkspaceEntity;

const activeUserWorkspace = {
  id: 'user-workspace-active',
  userId: 'user-active',
} as UserWorkspaceEntity;

const memberRole = { id: 'role-member' } as RoleEntity;

describe('buildWorkspaceMemberDtoArgs', () => {
  it('pairs each active member with its user workspace and roles', () => {
    expect(
      buildWorkspaceMemberDtoArgs({
        workspaceMemberEntities: [activeMember],
        userWorkspacesByUserId: new Map([['user-active', activeUserWorkspace]]),
        rolesByUserWorkspaceId: new Map([
          ['user-workspace-active', [memberRole]],
        ]),
      }),
    ).toEqual([
      {
        workspaceMemberEntity: activeMember,
        userWorkspace: activeUserWorkspace,
        userWorkspaceRoles: [memberRole],
      },
    ]);
  });

  it('skips a member whose user workspace is already soft-deleted instead of throwing', () => {
    expect(
      buildWorkspaceMemberDtoArgs({
        workspaceMemberEntities: [halfRemovedMember, activeMember],
        userWorkspacesByUserId: new Map([['user-active', activeUserWorkspace]]),
        rolesByUserWorkspaceId: new Map([
          ['user-workspace-active', [memberRole]],
        ]),
      }).map(({ workspaceMemberEntity }) => workspaceMemberEntity.id),
    ).toEqual(['member-active']);
  });

  it('still throws when an active pair has no roles', () => {
    expect(() =>
      buildWorkspaceMemberDtoArgs({
        workspaceMemberEntities: [activeMember],
        userWorkspacesByUserId: new Map([['user-active', activeUserWorkspace]]),
        rolesByUserWorkspaceId: new Map(),
      }),
    ).toThrow('UserEntity workspace roles not found');
  });
});
