import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { ChatbotFlow } from 'src/engine/core-modules/chatbot-flow/chatbot-flow.entity';
import { ChatbotFlowService } from 'src/engine/core-modules/chatbot-flow/chatbot-flow.service';
import { ChatbotFlowInput } from 'src/engine/core-modules/chatbot-flow/dtos/chatbot-flow.input';
import { UpdateChatbotFlowInput } from 'src/engine/core-modules/chatbot-flow/dtos/update-chatbot-flow.input';

@Resolver(() => ChatbotFlow)
export class ChatbotFlowResolver {
  constructor(private readonly chatbotFlowService: ChatbotFlowService) {}

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
}
