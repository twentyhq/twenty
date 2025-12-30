import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { ILike, IsNull, Repository } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type CreateAgentInput } from 'src/engine/metadata-modules/ai/ai-agent/dtos/create-agent.input';
import { type UpdateAgentInput } from 'src/engine/metadata-modules/ai/ai-agent/dtos/update-agent.input';
import { fromCreateAgentInputToFlatAgent } from 'src/engine/metadata-modules/ai/ai-agent/utils/from-create-agent-input-to-flat-agent.util';
import { fromUpdateAgentInputToFlatAgentToUpdate } from 'src/engine/metadata-modules/ai/ai-agent/utils/from-update-agent-input-to-flat-agent-to-update.util';
import { FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

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
        `Agent not found`,
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
          allFlatEntityOperationByMetadataName: {
            agent: {
              flatEntityToCreate: [flatAgentToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            roleTarget: {
              flatEntityToCreate: isDefined(flatRoleTargetToCreate)
                ? [flatRoleTargetToCreate]
                : [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
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
    const { flatRoleTargetByAgentIdMaps, flatAgentMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatRoleTargetByAgentIdMaps',
        'flatAgentMaps',
      ]);

    const {
      flatAgentToUpdate,
      flatRoleTargetToCreate,
      flatRoleTargetToDelete,
      flatRoleTargetToUpdate,
    } = fromUpdateAgentInputToFlatAgentToUpdate({
      updateAgentInput: input,
      flatAgentMaps,
      flatRoleTargetByAgentIdMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            agent: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatAgentToUpdate],
            },
            roleTarget: {
              flatEntityToCreate: isDefined(flatRoleTargetToCreate)
                ? [flatRoleTargetToCreate]
                : [],
              flatEntityToDelete: isDefined(flatRoleTargetToDelete)
                ? [flatRoleTargetToDelete]
                : [],
              flatEntityToUpdate: isDefined(flatRoleTargetToUpdate)
                ? [flatRoleTargetToUpdate]
                : [],
            },
          },
          workspaceId,
          isSystemBuild: false,
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
    const deletedAgents = await this.deleteManyAgents({
      ids: [id],
      workspaceId,
    });

    if (deletedAgents.length !== 1) {
      throw new AgentException(
        'Could not retrieve deleted agent',
        AgentExceptionCode.AGENT_NOT_FOUND,
      );
    }

    const [deletedAgent] = deletedAgents;

    return deletedAgent;
  }

  async deleteManyAgents({
    ids,
    workspaceId,
    isSystemBuild = false,
  }: {
    ids: string[];
    workspaceId: string;
    isSystemBuild?: boolean;
  }): Promise<FlatAgentWithRoleId[]> {
    if (ids.length === 0) {
      return [];
    }

    const { flatAgentMaps, flatRoleTargetByAgentIdMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatAgentMaps',
        'flatRoleTargetByAgentIdMaps',
      ]);

    const agentsToDelete = ids
      .map((id) =>
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: id,
          flatEntityMaps: flatAgentMaps,
        }),
      )
      .filter(isDefined);

    if (agentsToDelete.length === 0) {
      return [];
    }

    const roleTargetsToDelete = agentsToDelete
      .map((agent) => flatRoleTargetByAgentIdMaps[agent.id])
      .filter(isDefined);

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            agent: {
              flatEntityToCreate: [],
              flatEntityToDelete: agentsToDelete,
              flatEntityToUpdate: [],
            },
            roleTarget: {
              flatEntityToCreate: [],
              flatEntityToDelete: roleTargetsToDelete,
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        `Multiple validation errors occurred while deleting agent${ids.length > 1 ? 's' : ''}`,
      );
    }

    return agentsToDelete.map((agent) => ({
      ...agent,
      roleId: flatRoleTargetByAgentIdMaps[agent.id]?.roleId ?? null,
    }));
  }

  async searchAgents(
    query: string,
    workspaceId: string,
    options: { limit: number } = { limit: 2 },
  ): Promise<AgentEntity[]> {
    const queryLower = query.toLowerCase();

    return this.agentRepository.find({
      where: [
        { workspaceId, deletedAt: IsNull(), name: ILike(`%${queryLower}%`) },
        {
          workspaceId,
          deletedAt: IsNull(),
          description: ILike(`%${queryLower}%`),
        },
        { workspaceId, deletedAt: IsNull(), label: ILike(`%${queryLower}%`) },
      ],
      take: options.limit,
      order: { name: 'ASC' },
    });
  }
}
