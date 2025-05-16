import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ChatbotFlow } from 'src/engine/core-modules/chatbot-flow/chatbot-flow.entity';
import { ChatbotFlowInput } from 'src/engine/core-modules/chatbot-flow/dtos/chatbot-flow.input';
import { UpdateChatbotFlowInput } from 'src/engine/core-modules/chatbot-flow/dtos/update-chatbot-flow.input';
import { sanitizeFlow } from 'src/engine/core-modules/chatbot-flow/utils/sanitizeChatbotFlow';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class ChatbotFlowService {
  constructor(
    @InjectRepository(ChatbotFlow, 'core')
    private readonly chatbotFlowRepository: Repository<ChatbotFlow>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async validateOrCreateFlow(
    flow: ChatbotFlowInput,
    workspaceId: string,
  ): Promise<ChatbotFlow> {
    const chatbotFlow = await this.chatbotFlowRepository.findOne({
      where: {
        chatbotId: flow.chatbotId,
      },
    });

    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
      },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (chatbotFlow) {
      return { ...chatbotFlow, workspace };
    }

    const newFlow = sanitizeFlow(flow);

    const createdFlow = this.chatbotFlowRepository.create({
      ...newFlow,
      workspace: workspace,
    });

    return await this.chatbotFlowRepository.save(createdFlow);
  }

  async findById(chatbotId: string): Promise<ChatbotFlow | null> {
    return await this.chatbotFlowRepository.findOne({
      where: {
        chatbotId: chatbotId,
      },
    });
  }

  async updateFlow(flow: UpdateChatbotFlowInput): Promise<boolean> {
    const chatbotFlow = await this.chatbotFlowRepository.findOne({
      where: {
        chatbotId: flow.chatbotId,
      },
    });

    if (!chatbotFlow) {
      throw new Error('Flow not found');
    }

    const newFlow = sanitizeFlow(flow);

    const updateFlow = {
      ...chatbotFlow,
      ...newFlow,
    };

    await this.chatbotFlowRepository.save(updateFlow);

    return true;
  }
}
