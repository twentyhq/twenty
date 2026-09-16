import { isDefined } from 'twenty-shared/utils';

import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type ToWorkspaceMemberDtoArgs } from 'src/engine/core-modules/user/services/workspace-member-transpiler.service';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export const buildWorkspaceMemberDtoArgs = ({
  workspaceMemberEntities,
  userWorkspacesByUserId,
  rolesByUserWorkspaceId,
}: {
  workspaceMemberEntities: WorkspaceMemberWorkspaceEntity[];
  userWorkspacesByUserId: Map<string, UserWorkspaceEntity>;
  rolesByUserWorkspaceId: Map<string, RoleEntity[]>;
}): ToWorkspaceMemberDtoArgs[] =>
  workspaceMemberEntities.flatMap((workspaceMemberEntity) => {
    const userWorkspace = userWorkspacesByUserId.get(
      workspaceMemberEntity.userId,
    );

    // A member whose userWorkspace is already soft-deleted is mid-removal; listing it would fail GetCurrentUser for the whole workspace.
    if (!isDefined(userWorkspace)) {
      return [];
    }

    const userWorkspaceRoles = rolesByUserWorkspaceId.get(userWorkspace.id);

    if (!isDefined(userWorkspaceRoles)) {
      throw new Error('UserEntity workspace roles not found');
    }

    return [{ workspaceMemberEntity, userWorkspace, userWorkspaceRoles }];
  });
