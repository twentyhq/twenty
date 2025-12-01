import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { computeMetadataNameFromLabel } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { AiAgentRoleService } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.service';
import { type CreateAgentInput } from 'src/engine/metadata-modules/ai/ai-agent/dtos/create-agent.input';
import { type UpdateAgentInput } from 'src/engine/metadata-modules/ai/ai-agent/dtos/update-agent.input';
import { fromCreateAgentInputToFlatAgent } from 'src/engine/metadata-modules/ai/ai-agent/utils/from-create-agent-input-to-flat-agent.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { computeFlatEntityMapsFromTo } from 'src/engine/metadata-modules/flat-entity/utils/compute-flat-entity-maps-from-to.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

import { AgentException, AgentExceptionCode } from './agent.exception';

import { AgentEntity } from './entities/agent.entity';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(RoleTargetEntity)
    private readonly roleTargetRepository: Repository<RoleTargetEntity>,
    private readonly agentRoleService: AiAgentRoleService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
  ) {}

  async findManyAgents(workspaceId: string) {
    const agents = await this.agentRepository.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });

    if (agents.length === 0) {
      return [];
    }

    const agentRoleMap = await this.buildAgentRoleMap(workspaceId, agents);

    return agents.map((agent) => ({
      ...agent,
      roleId: agentRoleMap.get(agent.id) || null,
    }));
  }

  private async buildAgentRoleMap(
    workspaceId: string,
    agents: AgentEntity[],
  ): Promise<Map<string, string>> {
    const roleTargets = await this.roleTargetRepository.find({
      where: {
        workspaceId,
        agentId: In(agents.map((agent) => agent.id)),
      },
    });

    const agentRoleMap = new Map<string, string>();

    roleTargets.forEach((roleTarget) => {
      if (roleTarget.agentId) {
        agentRoleMap.set(roleTarget.agentId, roleTarget.roleId);
      }
    });

    return agentRoleMap;
  }

  async findOneByApplicationAndStandardId({
    applicationId,
    standardId,
    workspaceId,
  }: {
    applicationId: string;
    standardId: string;
    workspaceId: string;
  }) {
    return await this.agentRepository.findOne({
      where: { applicationId, standardId, workspaceId },
    });
  }

  async findOneAgent(
    workspaceId: string,
    { id, name }: { id?: string; name?: string },
  ) {
    this.validateAgentIdentifier(id, name);

    const agent = await this.fetchAgent(workspaceId, id, name);
    const roleId = await this.fetchAgentRoleId(workspaceId, agent.id);

    return {
      ...agent,
      roleId,
    };
  }

  private validateAgentIdentifier(
    id: string | undefined,
    name: string | undefined,
  ): void {
    if (!isNonEmptyString(id) && !isNonEmptyString(name)) {
      throw new AgentException(
        'Either id or name must be provided',
        AgentExceptionCode.AGENT_NOT_FOUND,
      );
    }

    if (isNonEmptyString(id) && isNonEmptyString(name)) {
      throw new AgentException(
        'Cannot specify both id and name',
        AgentExceptionCode.AGENT_NOT_FOUND,
      );
    }
  }

  private async fetchAgent(
    workspaceId: string,
    id: string | undefined,
    name: string | undefined,
  ): Promise<AgentEntity> {
    const agent = await this.agentRepository.findOne({
      where: id ? { id, workspaceId } : { name, workspaceId },
    });

    if (!agent) {
      const identifier = id ? `id "${id}"` : `name "${name}"`;

      throw new AgentException(
        `Agent with ${identifier} not found`,
        AgentExceptionCode.AGENT_NOT_FOUND,
      );
    }

    return agent;
  }

  private async fetchAgentRoleId(
    workspaceId: string,
    agentId: string,
  ): Promise<string | null> {
    const roleTarget = await this.roleTargetRepository.findOne({
      where: {
        agentId,
        workspaceId,
      },
      select: ['roleId'],
    });

    return roleTarget?.roleId || null;
  }

  async createOneAgent(
    input: CreateAgentInput & { isCustom: boolean },
    workspaceId: string,
  ) {
    const {
      flatAgentMaps: existingFlatAgentMaps,
      flatRoleTargetMaps: existingFlatRoleTargetMaps,
      flatRoleMaps: existingFlatRoleMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: ['flatAgentMaps', 'flatRoleTargetMaps', 'flatRoleMaps'],
      },
    );

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
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatAgentMaps'],
        },
      );

    const createdAgent = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatAgentToCreate.id,
      flatEntityMaps: recomputedFlatAgentMaps,
    });

    return {
      ...createdAgent,
      roleId: flatRoleTargetToCreate?.roleId ?? null,
    };
  }

  async updateOneAgent(input: UpdateAgentInput, workspaceId: string) {
    const agent = await this.findOneAgent(workspaceId, { id: input.id });
    const updateData = this.buildUpdateData(agent, input);
    const updatedAgent = await this.agentRepository.save(updateData);

    if (!('roleId' in input)) {
      return updatedAgent;
    }

    await this.updateAgentRole(workspaceId, agent.id, input.roleId);

    return this.findOneAgent(workspaceId, { id: updatedAgent.id });
  }

  private buildUpdateData(
    agent: AgentEntity & { roleId: string | null },
    input: UpdateAgentInput,
  ): Partial<AgentEntity> {
    const updateData: Partial<AgentEntity> = {
      ...agent,
      ...Object.fromEntries(
        Object.entries(input).filter(([_, value]) => value !== undefined),
      ),
    };

    if (input.label !== undefined) {
      updateData.name = computeMetadataNameFromLabel(input.label);
    } else if (input.name !== undefined) {
      updateData.name = input.name;
    }

    return updateData;
  }

  private async updateAgentRole(
    workspaceId: string,
    agentId: string,
    roleId: string | null | undefined,
  ): Promise<void> {
    if (isNonEmptyString(roleId)) {
      await this.agentRoleService.assignRoleToAgent({
        workspaceId,
        agentId,
        roleId,
      });

      return;
    }

    await this.agentRoleService.removeRoleFromAgent({
      workspaceId,
      agentId,
    });
  }

  async deleteOneAgent(id: string, workspaceId: string) {
    const { flatAgentMaps: existingFlatAgentMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatAgentMaps'],
        },
      );

    const agentToDelete = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
      flatEntityMaps: existingFlatAgentMaps,
    });

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
  }
}
