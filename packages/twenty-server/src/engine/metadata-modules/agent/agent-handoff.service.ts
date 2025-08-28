import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AgentHandoffEntity } from './agent-handoff.entity';
import { AgentEntity } from './agent.entity';
import { AgentException, AgentExceptionCode } from './agent.exception';

@Injectable()
export class AgentHandoffService {
  constructor(
    @InjectRepository(AgentEntity, 'core')
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(AgentHandoffEntity, 'core')
    private readonly agentHandoffRepository: Repository<AgentHandoffEntity>,
  ) {}

  async canHandoffTo({
    fromAgentId,
    toAgentId,
    workspaceId,
  }: {
    fromAgentId: string;
    toAgentId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const handoff = await this.agentHandoffRepository.findOne({
      where: {
        fromAgentId,
        toAgentId,
        workspaceId,
      },
    });

    return Boolean(handoff);
  }

  async getHandoffTargets({
    fromAgentId,
    workspaceId,
  }: {
    fromAgentId: string;
    workspaceId: string;
  }): Promise<AgentEntity[]> {
    const handoffs = await this.agentHandoffRepository.find({
      where: {
        fromAgentId,
        workspaceId,
      },
      relations: ['toAgent'],
    });

    return handoffs.map((handoff) => handoff.toAgent);
  }

  async getAgentHandoffs({
    fromAgentId,
    workspaceId,
  }: {
    fromAgentId: string;
    workspaceId: string;
  }): Promise<AgentHandoffEntity[]> {
    const handoffs = await this.agentHandoffRepository.find({
      where: {
        fromAgentId,
        workspaceId,
      },
      relations: ['toAgent'],
    });

    return handoffs;
  }

  async createHandoff({
    fromAgentId,
    toAgentId,
    workspaceId,
    description,
  }: {
    fromAgentId: string;
    toAgentId: string;
    workspaceId: string;
    description?: string;
  }): Promise<AgentHandoffEntity> {
    const [fromAgent, toAgent] = await Promise.all([
      this.agentRepository.findOne({
        where: { id: fromAgentId, workspaceId },
      }),
      this.agentRepository.findOne({
        where: { id: toAgentId, workspaceId },
      }),
    ]);

    if (!fromAgent) {
      throw new AgentException(
        `Agent with id ${fromAgentId} not found in workspace`,
        AgentExceptionCode.AGENT_NOT_FOUND,
      );
    }

    if (!toAgent) {
      throw new AgentException(
        `Agent with id ${toAgentId} not found in workspace`,
        AgentExceptionCode.AGENT_NOT_FOUND,
      );
    }

    const existingHandoff = await this.agentHandoffRepository.findOne({
      where: {
        fromAgentId,
        toAgentId,
        workspaceId,
      },
    });

    if (existingHandoff) {
      throw new AgentException(
        `Handoff from ${fromAgent.name} to ${toAgent.name} already exists`,
        AgentExceptionCode.HANDOFF_ALREADY_EXISTS,
      );
    }

    const handoff = await this.agentHandoffRepository.save({
      fromAgentId,
      toAgentId,
      workspaceId,
      description,
    });

    return handoff;
  }

  async removeHandoff({
    fromAgentId,
    toAgentId,
    workspaceId,
  }: {
    fromAgentId: string;
    toAgentId: string;
    workspaceId: string;
  }): Promise<void> {
    await this.agentHandoffRepository.delete({
      fromAgentId,
      toAgentId,
      workspaceId,
    });
  }

  async getWorkspaceHandoffs(
    workspaceId: string,
  ): Promise<AgentHandoffEntity[]> {
    return this.agentHandoffRepository.find({
      where: { workspaceId },
      relations: ['fromAgent', 'toAgent'],
    });
  }
}
