import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  AgentChatMessageEntity,
  AgentChatMessageRole,
} from 'src/engine/metadata-modules/agent/agent-chat-message.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/agent/agent-chat-thread.entity';

import { AgentExecutionService } from './agent-execution.service';

@Injectable()
export class AgentChatService {
  constructor(
    @InjectRepository(AgentChatThreadEntity, 'core')
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
    @InjectRepository(AgentChatMessageEntity, 'core')
    private readonly messageRepository: Repository<AgentChatMessageEntity>,
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

  async addMessage({
    threadId,
    role,
    content,
  }: {
    threadId: string;
    role: AgentChatMessageRole;
    content: string;
  }) {
    const message = this.messageRepository.create({
      threadId,
      role,
      content,
    });

    return this.messageRepository.save(message);
  }

  async getMessagesForThread(threadId: string) {
    return this.messageRepository.find({
      where: { threadId },
      order: { createdAt: 'ASC' },
    });
  }
}
