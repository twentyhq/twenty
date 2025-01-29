import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Agent } from 'src/engine/core-modules/agent/agent.entity';
import { AgentService } from 'src/engine/core-modules/agent/agent.service';
import { CreateAgentInput } from 'src/engine/core-modules/agent/dtos/create-agent.input';
import { UpdateAgentInput } from 'src/engine/core-modules/agent/dtos/update-agent.input';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => Agent)
export class AgentResolver {
  constructor(private readonly agentService: AgentService) {}

  @Mutation(() => Agent)
  async createAgent(
    @Args('createInput') createInput: CreateAgentInput,
  ): Promise<Agent> {
    const workspaceMember = await this.agentService.getWorkspaceMemberById(
      createInput.workspaceId,
      createInput.memberId,
    );

    if (!workspaceMember) {
      throw new Error('Member not found');
    }

    if (workspaceMember.agentId !== '') {
      throw new Error('The member is already assigned as an agent');
    }

    const agent = await this.agentService.create(createInput);

    await this.agentService.setAgentIdInWorkspaceMember(
      createInput.workspaceId,
      createInput.memberId,
      agent.id,
    );

    return agent;
  }

  @Query(() => [Agent])
  async agentsByWorkspace(
    @Args('workspaceId') workspaceId: string,
  ): Promise<Agent[]> {
    return await this.agentService.findAll(workspaceId);
  }

  @Query(() => Agent)
  async agentById(@Args('agentId') agentId: string): Promise<Agent | null> {
    return await this.agentService.findById(agentId);
  }

  @Mutation(() => Agent)
  async updateAgent(
    @Args('updateInput') updateInput: UpdateAgentInput,
  ): Promise<Agent> {
    return await this.agentService.update(updateInput);
  }

  @Mutation(() => Boolean)
  async toggleAgentStatus(@Args('agentId') agentId: string): Promise<boolean> {
    return await this.agentService.toggleStatus(agentId);
  }

  @Mutation(() => Agent)
  async deleteAgent(@Args('agentId') agentId: string): Promise<boolean> {
    return await this.agentService.delete(agentId);
  }
}
