import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import DataLoader from 'dataloader';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type RoleRelationLoaderPayload } from 'src/engine/dataloaders/types/role-relation-loader-payload.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class WorkspaceMembersByRoleIdLoaderFactory {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  create(): DataLoader<RoleRelationLoaderPayload, FlatWorkspaceMember[]> {
    return new DataLoader<RoleRelationLoaderPayload, FlatWorkspaceMember[]>(
      async (dataLoaderParams: readonly RoleRelationLoaderPayload[]) => {
        const workspaceId = dataLoaderParams[0].workspaceId;

        const [
          { flatRoleMaps, flatRoleTargetMaps },
          { flatWorkspaceMemberMaps },
        ] = await Promise.all([
          this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
            {
              workspaceId,
              flatMapsKeys: ['flatRoleMaps', 'flatRoleTargetMaps'],
            },
          ),
          this.workspaceCacheService.getOrRecompute(workspaceId, [
            'flatWorkspaceMemberMaps',
          ]),
        ]);

        const userWorkspaceIdsByRoleId = new Map(
          dataLoaderParams.map(({ roleId }) => {
            const flatRole = findFlatEntityByIdInFlatEntityMaps({
              flatEntityId: roleId,
              flatEntityMaps: flatRoleMaps,
            });

            if (!isDefined(flatRole)) {
              return [roleId, []];
            }

            return [
              roleId,
              findManyFlatEntityByIdInFlatEntityMaps({
                flatEntityIds: flatRole.roleTargetIds,
                flatEntityMaps: flatRoleTargetMaps,
              })
                .map((flatRoleTarget) => flatRoleTarget.userWorkspaceId)
                .filter(isDefined),
            ];
          }),
        );

        const allUserWorkspaceIds = [
          ...new Set([...userWorkspaceIdsByRoleId.values()].flat()),
        ];

        const userWorkspaces =
          allUserWorkspaceIds.length > 0
            ? await this.userWorkspaceRepository.find({
                select: { id: true, userId: true },
                where: { id: In(allUserWorkspaceIds), workspaceId },
              })
            : [];

        const userIdByUserWorkspaceId = new Map(
          userWorkspaces.map((userWorkspace) => [
            userWorkspace.id,
            userWorkspace.userId,
          ]),
        );

        return dataLoaderParams.map(({ roleId }) =>
          (userWorkspaceIdsByRoleId.get(roleId) ?? [])
            .map((userWorkspaceId) => {
              const userId = userIdByUserWorkspaceId.get(userWorkspaceId);
              const workspaceMemberId = isDefined(userId)
                ? flatWorkspaceMemberMaps.idByUserId[userId]
                : undefined;

              return isDefined(workspaceMemberId)
                ? flatWorkspaceMemberMaps.byId[workspaceMemberId]
                : undefined;
            })
            .filter(isDefined)
            .filter((workspaceMember) => !isDefined(workspaceMember.deletedAt)),
        );
      },
    );
  }
}
