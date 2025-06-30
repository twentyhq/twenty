import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ModelId } from 'src/engine/core-modules/ai/constants/ai-models.const';
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

  async createOneAgent(
    input: {
      name: string;
      description?: string;
      prompt: string;
      modelId: ModelId;
      responseFormat?: object;
    },
    workspaceId: string,
  ) {
    const agent = this.agentRepository.create({
      ...input,
      workspaceId,
    });

    const createdAgent = await this.agentRepository.save(agent);

    return this.findOneAgent(createdAgent.id, workspaceId);
  }

  async updateOneAgent(
    input: {
      id: string;
      name?: string;
      description?: string;
      prompt?: string;
      modelId?: ModelId;
      responseFormat?: object;
    },
    workspaceId: string,
  ) {
    const agent = await this.findOneAgent(input.id, workspaceId);

    const updatedAgent = await this.agentRepository.save({
      ...agent,
      ...input,
    });

    return updatedAgent;
  }

  async deleteOneAgent(id: string, workspaceId: string) {
    const agent = await this.findOneAgent(id, workspaceId);

    await this.agentRepository.softDelete({ id: agent.id });

    return agent;
  }
}
