import { Injectable } from '@nestjs/common';

import DataLoader from 'dataloader';
import { isDefined } from 'twenty-shared/utils';

import { type RoleRelationLoaderPayload } from 'src/engine/dataloaders/types/role-relation-loader-payload.type';
import { type AgentDTO } from 'src/engine/metadata-modules/ai/ai-agent/dtos/agent.dto';
import { fromFlatAgentWithRoleIdToAgentDto } from 'src/engine/metadata-modules/flat-agent/utils/from-agent-entity-to-agent-dto.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';

@Injectable()
export class AgentsByRoleIdLoaderFactory {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  create(): DataLoader<RoleRelationLoaderPayload, AgentDTO[]> {
    return new DataLoader<RoleRelationLoaderPayload, AgentDTO[]>(
      async (dataLoaderParams: readonly RoleRelationLoaderPayload[]) => {
        const workspaceId = dataLoaderParams[0].workspaceId;

        const {
          flatRoleMaps,
          flatRoleTargetMaps,
          flatAgentMaps,
          flatApplicationMaps,
        } =
          await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
            {
              workspaceId,
              flatMapsKeys: [
                'flatRoleMaps',
                'flatRoleTargetMaps',
                'flatAgentMaps',
                'flatApplicationMaps',
              ],
            },
          );

        return dataLoaderParams.map(({ roleId }) => {
          const flatRole = findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: roleId,
            flatEntityMaps: flatRoleMaps,
          });

          if (!isDefined(flatRole)) {
            return [];
          }

          const agentIds = findManyFlatEntityByIdInFlatEntityMaps({
            flatEntityIds: flatRole.roleTargetIds,
            flatEntityMaps: flatRoleTargetMaps,
          })
            .map((flatRoleTarget) => flatRoleTarget.agentId)
            .filter(isDefined);

          return findManyFlatEntityByIdInFlatEntityMaps({
            flatEntityIds: agentIds,
            flatEntityMaps: flatAgentMaps,
          })
            .filter(
              (flatAgent) =>
                !isDefined(flatAgent.deletedAt) &&
                isDefined(flatApplicationMaps.byId[flatAgent.applicationId]),
            )
            .map((flatAgent) =>
              fromFlatAgentWithRoleIdToAgentDto({ ...flatAgent, roleId }),
            );
        });
      },
    );
  }
}
