import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { AgentRoleService } from 'src/engine/metadata-modules/agent-role/agent-role.service';
import { AgentChatService } from 'src/engine/metadata-modules/agent/agent-chat.service';
import { CreateAgentInput } from 'src/engine/metadata-modules/agent/dtos/create-agent.input';
import { UpdateAgentInput } from 'src/engine/metadata-modules/agent/dtos/update-agent.input';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/compute-metadata-name-from-label.util';

import { AgentEntity } from './agent.entity';
import { AgentException, AgentExceptionCode } from './agent.exception';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(AgentEntity, 'core')
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(RoleTargetsEntity, 'core')
    private readonly roleTargetsRepository: Repository<RoleTargetsEntity>,
    private readonly agentChatService: AgentChatService,
    private readonly agentRoleService: AgentRoleService,
  ) {}

  async findOneAgent(id: string, workspaceId: string) {
    const agent = await this.agentRepository.findOne({
      where: { id, workspaceId },
    });

    if (!agent) {
      throw new AgentException(
        `Agent with id ${id} not found`,
        AgentExceptionCode.AGENT_NOT_FOUND,
      );
    }

    const roleTarget = await this.roleTargetsRepository.findOne({
      where: {
        agentId: id,
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

    return this.findOneAgent(createdAgent.id, workspaceId);
  }

  async updateOneAgent(input: UpdateAgentInput, workspaceId: string) {
    const agent = await this.findOneAgent(input.id, workspaceId);

    let updatedName = input.name;

    if (input.label) {
      updatedName = computeMetadataNameFromLabel(input.label);
    }

    const updatedAgent = await this.agentRepository.save({
      ...agent,
      ...input,
      name: updatedName,
    });

    if (!isDefined(input.roleId)) {
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

    return this.findOneAgent(updatedAgent.id, workspaceId);
  }

  async deleteOneAgent(id: string, workspaceId: string) {
    const agent = await this.findOneAgent(id, workspaceId);

    await this.agentRepository.softDelete({ id: agent.id });

    return agent;
  }
}
