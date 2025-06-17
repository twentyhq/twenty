import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import { AgentService } from './agent.service';

import { AgentIdInput } from './dtos/agent-id.input';
import { AgentDTO } from './dtos/agent.dto';
import { CreateAgentInput } from './dtos/create-agent.input';
import { UpdateAgentInput } from './dtos/update-agent.input';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
export class AgentResolver {
  constructor(
    private readonly agentService: AgentService,
    @InjectRepository(FeatureFlag, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlag>,
  ) {}

  private async checkFeatureFlag(workspaceId: string) {
    const isAiEnabled = await this.featureFlagRepository.findOneBy({
      workspaceId,
      key: FeatureFlagKey.IS_AI_ENABLED,
      value: true,
    });

    if (!isAiEnabled) {
      throw new Error('AI feature is not enabled for this workspace');
    }
  }

  @Query(() => AgentDTO)
  async findOneAgent(
    @Args('input') { id }: AgentIdInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    await this.checkFeatureFlag(workspaceId);

    return this.agentService.findOneAgent(id, workspaceId);
  }

  @Query(() => [AgentDTO])
  async findManyAgents(@AuthWorkspace() { id: workspaceId }: Workspace) {
    await this.checkFeatureFlag(workspaceId);

    return this.agentService.findManyAgents(workspaceId);
  }

  @Mutation(() => AgentDTO)
  async createOneAgent(
    @Args('input') input: CreateAgentInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    await this.checkFeatureFlag(workspaceId);

    return this.agentService.createOneAgent(input, workspaceId);
  }

  @Mutation(() => AgentDTO)
  async updateOneAgent(
    @Args('input') input: UpdateAgentInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    await this.checkFeatureFlag(workspaceId);

    return this.agentService.updateOneAgent(input, workspaceId);
  }

  @Mutation(() => AgentDTO)
  async deleteOneAgent(
    @Args('input') { id }: AgentIdInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    await this.checkFeatureFlag(workspaceId);

    return this.agentService.deleteOneAgent(id, workspaceId);
  }
}
