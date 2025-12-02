import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type CreateAgentInput } from 'src/engine/metadata-modules/ai/ai-agent/dtos/create-agent.input';
import { type UpdateAgentInput } from 'src/engine/metadata-modules/ai/ai-agent/dtos/update-agent.input';
import { fromCreateAgentInputToFlatAgent } from 'src/engine/metadata-modules/ai/ai-agent/utils/from-create-agent-input-to-flat-agent.util';
import { fromUpdateAgentInputToFlatAgentToUpdate } from 'src/engine/metadata-modules/ai/ai-agent/utils/from-update-agent-input-to-flat-agent-to-update.util';
import { FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { computeFlatEntityMapsFromTo } from 'src/engine/metadata-modules/flat-entity/utils/compute-flat-entity-maps-from-to.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

import { AgentException, AgentExceptionCode } from './agent.exception';

import { AgentEntity } from './entities/agent.entity';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async findManyAgents(workspaceId: string): Promise<FlatAgentWithRoleId[]> {
    const { flatAgentMaps, flatRoleTargetByAgentIdMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatAgentMaps',
        'flatRoleTargetByAgentIdMaps',
      ]);

    return Object.values(flatAgentMaps.byId)
      .filter(isDefined)
      .map((flatAgent) => {
        const roleId = flatRoleTargetByAgentIdMaps[flatAgent.id]?.roleId;

        return {
          ...flatAgent,
          roleId: roleId ?? null,
        };
      });
  }

  async findOneAgentByName({
    name,
    workspaceId,
  }: {
    workspaceId: string;
    name: string;
  }): Promise<AgentEntity> {
    const agent = await this.agentRepository.findOne({
      where: { name, workspaceId },
    });

    if (!agent) {
      const identifier = `name "${name}"`;

      throw new AgentException(
        `Agent with ${identifier} not found`,
        AgentExceptionCode.AGENT_NOT_FOUND,
      );
    }

    return agent;
  }

  async findOneAgentById({
    id,
    workspaceId,
  }: {
    workspaceId: string;
    id: string;
  }): Promise<FlatAgentWithRoleId> {
    const { flatAgentMaps, flatRoleTargetByAgentIdMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatAgentMaps',
        'flatRoleTargetByAgentIdMaps',
      ]);

    const flatAgent = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatAgentMaps,
    });

    if (!isDefined(flatAgent)) {
      throw new AgentException(
        `Agent ${id} not found`,
        AgentExceptionCode.AGENT_NOT_FOUND,
      );
    }

    const roleId = flatRoleTargetByAgentIdMaps[flatAgent.id]?.roleId;

    return { ...flatAgent, roleId: roleId ?? null };
  }

  async createOneAgent(
    input: CreateAgentInput & { isCustom: boolean },
    workspaceId: string,
  ): Promise<FlatAgentWithRoleId> {
    const {
      flatAgentMaps: existingFlatAgentMaps,
      flatRoleTargetMaps: existingFlatRoleTargetMaps,
      flatRoleMaps: existingFlatRoleMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatAgentMaps',
      'flatRoleTargetMaps',
      'flatRoleMaps',
    ]);

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const { flatAgentToCreate, flatRoleTargetToCreate } =
      fromCreateAgentInputToFlatAgent({
        createAgentInput: {
          ...input,
          applicationId:
            input.applicationId ?? workspaceCustomFlatApplication.id,
        },
        workspaceId,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatAgentMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatAgentMaps,
              flatEntityToCreate: [flatAgentToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            }),
            flatRoleTargetMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatRoleTargetMaps,
              flatEntityToCreate: isDefined(flatRoleTargetToCreate)
                ? [flatRoleTargetToCreate]
                : [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            }),
          },
          dependencyAllFlatEntityMaps: { flatRoleMaps: existingFlatRoleMaps },
          buildOptions: {
            isSystemBuild: false,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating agent',
      );
    }

    const { flatAgentMaps: recomputedFlatAgentMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatAgentMaps',
      ]);

    const createdAgent = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatAgentToCreate.id,
      flatEntityMaps: recomputedFlatAgentMaps,
    });

    return {
      ...createdAgent,
      roleId: flatRoleTargetToCreate?.roleId ?? null,
    };
  }

  async updateOneAgent({
    input,
    workspaceId,
  }: {
    input: UpdateAgentInput;
    workspaceId: string;
  }): Promise<FlatAgentWithRoleId> {
    const {
      flatAgentMaps: existingFlatAgentMaps,
      flatRoleTargetMaps: existingFlatRoleTargetMaps,
      flatRoleMaps: existingFlatRoleMaps,
      flatRoleTargetByAgentIdMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatAgentMaps',
      'flatRoleTargetMaps',
      'flatRoleMaps',
      'flatRoleTargetByAgentIdMaps',
    ]);

    const {
      flatAgentToUpdate,
      flatRoleTargetToCreate,
      flatRoleTargetToDelete,
      flatRoleTargetToUpdate,
    } = fromUpdateAgentInputToFlatAgentToUpdate({
      updateAgentInput: input,
      flatAgentMaps: existingFlatAgentMaps,
      flatRoleTargetByAgentIdMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatAgentMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatAgentMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatAgentToUpdate],
            }),
            flatRoleTargetMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatRoleTargetMaps,
              flatEntityToCreate: isDefined(flatRoleTargetToCreate)
                ? [flatRoleTargetToCreate]
                : [],
              flatEntityToDelete: isDefined(flatRoleTargetToDelete)
                ? [flatRoleTargetToDelete]
                : [],
              flatEntityToUpdate: isDefined(flatRoleTargetToUpdate)
                ? [flatRoleTargetToUpdate]
                : [],
            }),
          },
          dependencyAllFlatEntityMaps: { flatRoleMaps: existingFlatRoleMaps },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: {
              roleTarget: isDefined(flatRoleTargetToDelete),
            },
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating agent',
      );
    }

    const {
      flatAgentMaps: recomputedFlatAgentMaps,
      flatRoleTargetByAgentIdMaps: recmputedFlatRoleTargetByAgentIdMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatAgentMaps',
      'flatRoleTargetByAgentIdMaps',
    ]);

    const updatedAgent = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: input.id,
      flatEntityMaps: recomputedFlatAgentMaps,
    });

    const existingRoleTarget =
      recmputedFlatRoleTargetByAgentIdMaps[flatAgentToUpdate.id];

    return {
      ...updatedAgent,
      roleId: existingRoleTarget?.roleId ?? null,
    };
  }

  async deleteOneAgent(
    id: string,
    workspaceId: string,
  ): Promise<FlatAgentWithRoleId> {
    const {
      flatAgentMaps: existingFlatAgentMaps,
      flatRoleTargetByAgentIdMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatAgentMaps',
      'flatRoleTargetByAgentIdMaps',
    ]);

    const agentToDelete = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: existingFlatAgentMaps,
    });

    if (!isDefined(agentToDelete)) {
      throw new AgentException(
        `Agent ${id} not found`,
        AgentExceptionCode.AGENT_NOT_FOUND,
      );
    }

    const roleId = flatRoleTargetByAgentIdMaps[agentToDelete.id]?.roleId;

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatAgentMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatAgentMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [agentToDelete],
              flatEntityToUpdate: [],
            }),
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: {
              agent: true,
            },
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting agent',
      );
    }

    return {
      ...agentToDelete,
      roleId: roleId ?? null,
    };
  }
}
