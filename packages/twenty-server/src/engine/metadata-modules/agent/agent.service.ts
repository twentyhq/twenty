import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AgentEntity } from './agent.entity';
import { AgentException, AgentExceptionCode } from './agent.exception';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(AgentEntity, 'core')
    private readonly agentRepository: Repository<AgentEntity>,
  ) {}

  async findManyAgents(workspaceId: string) {
    return this.agentRepository.find({
      where: { workspaceId },
      relations: ['aiModel'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneAgent(id: string, workspaceId: string) {
    const agent = await this.agentRepository.findOne({
      where: { id, workspaceId },
      relations: ['aiModel'],
    });

    if (!agent) {
      throw new AgentException(
        `Agent with id ${id} not found`,
        AgentExceptionCode.AGENT_NOT_FOUND,
      );
    }

    return agent;
  }

  async createOneAgent(
    input: {
      name: string;
      description?: string;
      prompt: string;
      modelId: string;
      responseFormat: string;
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
      modelId?: string;
      responseFormat?: string;
    },
    workspaceId: string,
  ) {
    const agent = await this.findOneAgent(input.id, workspaceId);

    const updatedAgent = await this.agentRepository.save({
      ...agent,
      ...input,
    });

    return this.findOneAgent(updatedAgent.id, workspaceId);
  }

  async deleteOneAgent(id: string, workspaceId: string) {
    const agent = await this.findOneAgent(id, workspaceId);

    await this.agentRepository.softDelete({ id: agent.id });

    return agent;
  }
}
