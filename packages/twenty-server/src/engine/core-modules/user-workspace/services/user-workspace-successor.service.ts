import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Not, Repository } from 'typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { RolePermissionsService } from 'src/engine/permissions/role-permissions.service';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

@Injectable()
export class UserWorkspaceSuccessorService {
  constructor(
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly rolePermissionsService: RolePermissionsService,
  ) {}

  async findSuccessorUserWorkspace({
    removedUserWorkspace,
    actingUserWorkspaceId,
  }: {
    removedUserWorkspace: Pick<UserWorkspaceEntity, 'id' | 'workspaceId'>;
    actingUserWorkspaceId?: string;
  }): Promise<UserWorkspaceEntity | undefined> {
    const otherUserWorkspaces = await this.userWorkspaceRepository.find({
      where: {
        workspaceId: removedUserWorkspace.workspaceId,
        id: Not(removedUserWorkspace.id),
      },
      order: { createdAt: 'ASC' },
    });

    if (otherUserWorkspaces.length === 0) {
      return undefined;
    }

    const actingUserWorkspace = otherUserWorkspaces.find(
      (otherUserWorkspace) => otherUserWorkspace.id === actingUserWorkspaceId,
    );

    if (isDefined(actingUserWorkspace)) {
      return actingUserWorkspace;
    }

    const rolesByUserWorkspaceId =
      await this.rolePermissionsService.findRolesByUserWorkspaceIds({
        userWorkspaceIds: otherUserWorkspaces.map(
          (otherUserWorkspace) => otherUserWorkspace.id,
        ),
        workspaceId: removedUserWorkspace.workspaceId,
      });

    const oldestAdminUserWorkspace = otherUserWorkspaces.find(
      (otherUserWorkspace) =>
        rolesByUserWorkspaceId
          .get(otherUserWorkspace.id)
          ?.some(
            (role) =>
              role.universalIdentifier ===
              STANDARD_ROLE.admin.universalIdentifier,
          ),
    );

    return oldestAdminUserWorkspace ?? otherUserWorkspaces[0];
  }
}
