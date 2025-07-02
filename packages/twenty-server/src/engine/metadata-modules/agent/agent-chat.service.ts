import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AgentChatMessagesEntity } from 'src/engine/metadata-modules/agent/agent-chat-message.entity';
import { AgentChatThreadsEntity } from 'src/engine/metadata-modules/agent/agent-chat-thread.entity';

import { AgentExecutionService } from './agent-execution.service';

@Injectable()
export class AgentChatService {
  constructor(
    @InjectRepository(AgentChatThreadsEntity, 'core')
    private readonly threadRepository: Repository<AgentChatThreadsEntity>,
    @InjectRepository(AgentChatMessagesEntity, 'core')
    private readonly messageRepository: Repository<AgentChatMessagesEntity>,
    private readonly agentExecutionService: AgentExecutionService,
  ) {}

  async createThread(agentId: string) {
    const thread = this.threadRepository.create({ agentId });

    return this.threadRepository.save(thread);
  }

  async getThreadsForAgent(agentId: string) {
    return this.threadRepository.find({
      where: { agentId },
      order: { createdAt: 'DESC' },
    });
  }

  async addMessage(threadId: string, sender: 'user' | 'ai', text: string) {
    const message = this.messageRepository.create({
      threadId,
      sender,
      message: text,
    });

    return this.messageRepository.save(message);
  }

  async getMessagesForThread(threadId: string) {
    return this.messageRepository.find({
      where: { threadId },
      order: { createdAt: 'ASC' },
    });
  }

  async addUserMessageAndAIResponse(threadId: string, userMessage: string) {
    const userMsg = await this.addMessage(threadId, 'user', userMessage);
    const thread = await this.threadRepository.findOneOrFail({
      where: { id: threadId },
      relations: ['messages'],
    });
    const aiResponseText = await this.agentExecutionService.getChatResponse({
      agentId: thread.agentId,
      userMessage,
      messages: thread.messages,
    });
    const aiMsg = await this.addMessage(threadId, 'ai', aiResponseText);

    return [userMsg, aiMsg];
  }
}
