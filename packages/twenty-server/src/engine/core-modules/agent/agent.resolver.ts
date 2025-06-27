import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { WorkspaceAgent } from 'src/engine/core-modules/agent/agent.entity';
import { AgentService } from 'src/engine/core-modules/agent/agent.service';
import { CreateWorkspaceAgentInput } from 'src/engine/core-modules/agent/dtos/create-agent.input';
import { UpdateWorkspaceAgentInput } from 'src/engine/core-modules/agent/dtos/update-agent.input';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => WorkspaceAgent)
export class AgentResolver {
  constructor(private readonly agentService: AgentService) {}

  @Mutation(() => WorkspaceAgent)
  async createAgent(
    @Args('createInput') createInput: CreateWorkspaceAgentInput,
  ): Promise<WorkspaceAgent> {
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

  @Query(() => [WorkspaceAgent])
  async agentsByWorkspace(
    @Args('workspaceId') workspaceId: string,
  ): Promise<WorkspaceAgent[]> {
    return await this.agentService.findAll(workspaceId);
  }

  @Query(() => WorkspaceAgent)
  async agentById(
    @Args('agentId') agentId: string,
  ): Promise<WorkspaceAgent | null> {
    return await this.agentService.findById(agentId);
  }

  @Mutation(() => WorkspaceAgent)
  async updateAgent(
    @Args('updateInput') updateInput: UpdateWorkspaceAgentInput,
  ): Promise<WorkspaceAgent> {
    return await this.agentService.update(updateInput);
  }

  @Mutation(() => Boolean)
  async toggleAgentStatus(@Args('agentId') agentId: string): Promise<boolean> {
    return await this.agentService.toggleStatus(agentId);
  }

  @Mutation(() => WorkspaceAgent)
  async deleteAgent(@Args('agentId') agentId: string): Promise<boolean> {
    return await this.agentService.delete(agentId);
  }
}
