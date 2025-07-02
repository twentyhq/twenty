import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { FeatureFlagGuard } from 'src/engine/guards/feature-flag.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import { AgentChatService } from './agent-chat.service';

import { AgentChatMessageDTO } from './dtos/agent-chat-message.dto';
import { AgentChatThreadDTO } from './dtos/agent-chat-thread.dto';
import { CreateAgentChatThreadInput } from './dtos/create-agent-chat-thread.input';
import { SendAgentChatMessageInput } from './dtos/send-agent-chat-message.input';

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
    @Args('input') input: CreateAgentChatThreadInput,
  ) {
    return this.chatService.createThread(input.agentId);
  }

  @Mutation(() => [AgentChatMessageDTO])
  async sendAgentChatMessage(@Args('input') input: SendAgentChatMessageInput) {
    return this.chatService.addUserMessageAndAIResponse(
      input.threadId,
      input.message,
    );
  }
}
