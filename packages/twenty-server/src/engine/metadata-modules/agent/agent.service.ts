import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ModelId } from 'src/engine/core-modules/ai/constants/ai-models.const';
import { AgentRoleService } from 'src/engine/metadata-modules/agent-role/agent-role.service';
import { AgentChatService } from 'src/engine/metadata-modules/agent/agent-chat.service';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';

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

  async findManyAgents(workspaceId: string) {
    return this.agentRepository.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

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

  async createOneAgentAndFirstThread(
    input: {
      name: string;
      label: string;
      description?: string;
      prompt: string;
      modelId: ModelId;
    },
    workspaceId: string,
    userWorkspaceId: string | null,
  ) {
    const agent = await this.createOneAgent(input, workspaceId);

    if (!userWorkspaceId) {
      throw new AgentException(
        'User workspace ID not found',
        AgentExceptionCode.USER_WORKSPACE_ID_NOT_FOUND,
      );
    }

    await this.agentChatService.createThread(agent.id, userWorkspaceId);

    return agent;
  }

  async createOneAgent(
    input: {
      name: string;
      label: string;
      description?: string;
      icon?: string;
      prompt: string;
      modelId: ModelId;
      roleId?: string;
      responseFormat?: object;
      isCustom?: boolean;
    },
    workspaceId: string,
  ) {
    const agent = this.agentRepository.create({
      ...input,
      workspaceId,
      isCustom: input.isCustom ?? true,
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

  async updateOneAgent(
    input: {
      id: string;
      name?: string;
      label?: string;
      description?: string;
      icon?: string;
      prompt?: string;
      modelId?: ModelId;
      roleId?: string;
      responseFormat?: object;
    },
    workspaceId: string,
  ) {
    const agent = await this.findOneAgent(input.id, workspaceId);

    const updatedAgent = await this.agentRepository.save({
      ...agent,
      ...input,
    });

    if (input.roleId === undefined) {
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
