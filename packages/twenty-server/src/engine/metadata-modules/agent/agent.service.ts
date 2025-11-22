import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { AgentRoleService } from 'src/engine/metadata-modules/agent-role/agent-role.service';
import { type CreateAgentInput } from 'src/engine/metadata-modules/agent/dtos/create-agent.input';
import { type UpdateAgentInput } from 'src/engine/metadata-modules/agent/dtos/update-agent.input';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/compute-metadata-name-from-label.util';

import { AgentEntity } from './agent.entity';
import { AgentException, AgentExceptionCode } from './agent.exception';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(RoleTargetsEntity)
    private readonly roleTargetsRepository: Repository<RoleTargetsEntity>,
    private readonly agentRoleService: AgentRoleService,
  ) {}

  async findManyAgents(workspaceId: string) {
    const agents = await this.agentRepository.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });

    if (agents.length === 0) {
      return [];
    }

    const roleTargets = await this.roleTargetsRepository.find({
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

    return agents.map((agent) => ({
      ...agent,
      roleId: agentRoleMap.get(agent.id) || null,
    }));
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
    if (!id && !name) {
      throw new AgentException(
        'Either id or name must be provided',
        AgentExceptionCode.AGENT_NOT_FOUND,
      );
    }

    if (id && name) {
      throw new AgentException(
        'Cannot specify both id and name',
        AgentExceptionCode.AGENT_NOT_FOUND,
      );
    }

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

    const roleTarget = await this.roleTargetsRepository.findOne({
      where: {
        agentId: agent.id,
        workspaceId,
      },
      select: ['roleId'],
    });

    return {
      ...agent,
      roleId: roleTarget?.roleId || null,
    };
  }

  async createOneAgent(
    input: CreateAgentInput & { isCustom: boolean },
    workspaceId: string,
  ) {
    const agent = this.agentRepository.create({
      ...input,
      name: input.name || computeMetadataNameFromLabel(input.label),
      workspaceId,
      isCustom: input.isCustom,
    });

    const createdAgent = await this.agentRepository.save(agent);

    if (input.roleId) {
      await this.agentRoleService.assignRoleToAgent({
        workspaceId,
        agentId: createdAgent.id,
        roleId: input.roleId,
      });
    }

    return this.findOneAgent(workspaceId, { id: createdAgent.id });
  }

  async updateOneAgent(input: UpdateAgentInput, workspaceId: string) {
    const agent = await this.findOneAgent(workspaceId, { id: input.id });

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

    const updatedAgent = await this.agentRepository.save(updateData);

    if (!('roleId' in input)) {
      return updatedAgent;
    }

    if (input.roleId) {
      await this.agentRoleService.assignRoleToAgent({
        workspaceId,
        agentId: agent.id,
        roleId: input.roleId,
      });
    } else {
      await this.agentRoleService.removeRoleFromAgent({
        workspaceId,
        agentId: agent.id,
      });
    }

    return this.findOneAgent(workspaceId, { id: updatedAgent.id });
  }

  async deleteOneAgent(id: string, workspaceId: string) {
    const agent = await this.findOneAgent(workspaceId, { id });

    await this.agentRepository.softDelete({ id: agent.id });

    return agent;
  }
}
