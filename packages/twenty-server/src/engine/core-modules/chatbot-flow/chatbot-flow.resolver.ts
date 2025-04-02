import { ForbiddenException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ChatbotFlow } from 'src/engine/core-modules/chatbot-flow/chatbot-flow.entity';
import { ChatbotFlowService } from 'src/engine/core-modules/chatbot-flow/chatbot-flow.service';
import { ChatbotFlowInput } from 'src/engine/core-modules/chatbot-flow/dtos/chatbot-flow.input';
import { UpdateChatbotFlowInput } from 'src/engine/core-modules/chatbot-flow/dtos/update-chatbot-flow.input';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ChatbotWorkspaceEntity } from 'src/modules/chatbot/standard-objects/chatbot.workspace-entity';

@Resolver(() => ChatbotFlow)
export class ChatbotFlowResolver {
  constructor(
    private readonly chatbotFlowService: ChatbotFlowService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @Mutation(() => ChatbotFlow)
  async validateChatbotFlow(
    @Args('chatbotInput') chatbotInput: ChatbotFlowInput,
  ): Promise<ChatbotFlow> {
    return await this.chatbotFlowService.validateOrCreateFlow(chatbotInput);
  }

  @Mutation(() => Boolean)
  async updateChatbotFlow(
    @Args('updateChatbotInput') updateChatbotInput: UpdateChatbotFlowInput,
  ): Promise<boolean> {
    return await this.chatbotFlowService.updateFlow(updateChatbotInput);
  }

  @Query(() => [ChatbotWorkspaceEntity])
  async getChatbots(@AuthWorkspace() workspace: Workspace) {
    if (!workspace) {
      throw new ForbiddenException('Workspace not found');
    }

    const chatbotsRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ChatbotWorkspaceEntity>(
        workspace.id,
        'chatbot',
      );

    const chatbots = await chatbotsRepository.find();

    return chatbots;
  }
}
