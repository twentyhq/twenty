import { Injectable } from '@nestjs/common';

import DataLoader from 'dataloader';
import { isDefined } from 'twenty-shared/utils';

import { type RoleRelationLoaderPayload } from 'src/engine/dataloaders/types/role-relation-loader-payload.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type ApiKeyForRoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ApiKeysByRoleIdLoaderFactory {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  create(): DataLoader<RoleRelationLoaderPayload, ApiKeyForRoleDTO[]> {
    return new DataLoader<RoleRelationLoaderPayload, ApiKeyForRoleDTO[]>(
      async (dataLoaderParams: readonly RoleRelationLoaderPayload[]) => {
        const workspaceId = dataLoaderParams[0].workspaceId;

        const [{ flatRoleMaps, flatRoleTargetMaps }, { apiKeyMap }] =
          await Promise.all([
            this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
              {
                workspaceId,
                flatMapsKeys: ['flatRoleMaps', 'flatRoleTargetMaps'],
              },
            ),
            this.workspaceCacheService.getOrRecompute(workspaceId, [
              'apiKeyMap',
            ]),
          ]);

        return dataLoaderParams.map(({ roleId }) => {
          const flatRole = findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: roleId,
            flatEntityMaps: flatRoleMaps,
          });

          if (!isDefined(flatRole)) {
            return [];
          }

          return findManyFlatEntityByIdInFlatEntityMaps({
            flatEntityIds: flatRole.roleTargetIds,
            flatEntityMaps: flatRoleTargetMaps,
          })
            .map((flatRoleTarget) =>
              isDefined(flatRoleTarget.apiKeyId)
                ? apiKeyMap[flatRoleTarget.apiKeyId]
                : undefined,
            )
            .filter(isDefined)
            .filter((flatApiKey) => !isDefined(flatApiKey.revokedAt))
            .map((flatApiKey) => ({
              id: flatApiKey.id,
              name: flatApiKey.name,
              expiresAt: new Date(flatApiKey.expiresAt),
              revokedAt: null,
            }));
        });
      },
    );
  }
}
