import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { FeatureFlagGuard } from 'src/engine/guards/feature-flag.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import { AgentChatService } from './agent-chat.service';

import { AgentChatMessageDTO } from './dtos/agent-chat-message.dto';
import { AgentChatThreadDTO } from './dtos/agent-chat-thread.dto';

@Resolver()
@UseGuards(WorkspaceAuthGuard, FeatureFlagGuard)
export class AgentChatResolver {
  constructor(private readonly chatService: AgentChatService) {}

  @Query(() => [AgentChatThreadDTO])
  async agentChatThreads(@Args('agentId', { type: () => ID }) agentId: string) {
    return this.chatService.getThreadsForAgent(agentId);
  }

  @Query(() => [AgentChatMessageDTO])
  async agentChatMessages(
    @Args('threadId', { type: () => ID }) threadId: string,
  ) {
    return this.chatService.getMessagesForThread(threadId);
  }

  @Mutation(() => AgentChatThreadDTO)
  async createAgentChatThread(
    @Args('agentId', { type: () => ID }) agentId: string,
  ) {
    return this.chatService.createThread(agentId);
  }

  @Mutation(() => [AgentChatMessageDTO])
  async sendAgentChatMessage(
    @Args('threadId', { type: () => ID }) threadId: string,
    @Args('content', { type: () => String }) content: string,
  ) {
    return this.chatService.addUserMessageAndAIResponse(threadId, content);
  }
}
