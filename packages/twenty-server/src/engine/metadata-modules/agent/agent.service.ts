import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';

import { AgentExecutionService } from './agent-execution.service';
import { AgentEntity } from './agent.entity';
import { AgentException, AgentExceptionCode } from './agent.exception';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(AgentEntity, 'core')
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(FeatureFlag, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlag>,
    private readonly throttlerService: ThrottlerService,
    private readonly agentExecutionService: AgentExecutionService,
  ) {}

  private async checkFeatureFlag(workspaceId: string) {
    const featureFlag = await this.featureFlagRepository.findOneBy({
      key: FeatureFlagKey.IS_WORKFLOW_ENABLED,
      workspaceId,
    });

    if (!featureFlag?.value) {
      throw new AgentException(
        'Workflow feature is not enabled for this workspace',
        AgentExceptionCode.FEATURE_FLAG_INVALID,
      );
    }
  }

  async findManyAgents(workspaceId: string) {
    await this.checkFeatureFlag(workspaceId);

    return this.agentRepository.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneAgent(id: string, workspaceId: string) {
    await this.checkFeatureFlag(workspaceId);

    const agent = await this.agentRepository.findOne({
      where: { id, workspaceId },
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
      model: string;
      responseFormat: string;
    },
    workspaceId: string,
  ) {
    await this.checkFeatureFlag(workspaceId);

    const existingAgent = await this.agentRepository.findOne({
      where: { name: input.name, workspaceId },
    });

    if (existingAgent) {
      throw new AgentException(
        `Agent with name ${input.name} already exists`,
        AgentExceptionCode.AGENT_ALREADY_EXISTS,
      );
    }

    const agent = this.agentRepository.create({
      ...input,
      workspaceId,
    });

    const createdAgent = await this.agentRepository.save(agent);

    return createdAgent;
  }

  async updateOneAgent(
    input: {
      id: string;
      name?: string;
      description?: string;
      prompt?: string;
      model?: string;
      responseFormat?: string;
    },
    workspaceId: string,
  ) {
    await this.checkFeatureFlag(workspaceId);

    const existingAgent = await this.findOneAgent(input.id, workspaceId);

    if (input.name && input.name !== existingAgent.name) {
      const nameExists = await this.agentRepository.findOne({
        where: { name: input.name, workspaceId },
      });

      if (nameExists) {
        throw new AgentException(
          `Agent with name ${input.name} already exists`,
          AgentExceptionCode.AGENT_ALREADY_EXISTS,
        );
      }
    }

    await this.agentRepository.update(input.id, {
      name: input.name,
      description: input.description,
      prompt: input.prompt,
      model: input.model,
      responseFormat: input.responseFormat,
    });

    const updatedAgent = await this.findOneAgent(input.id, workspaceId);

    return updatedAgent;
  }

  async deleteOneAgent(id: string, workspaceId: string) {
    await this.checkFeatureFlag(workspaceId);

    const agent = await this.findOneAgent(id, workspaceId);

    await this.agentRepository.softDelete({ id });

    return agent;
  }
}
