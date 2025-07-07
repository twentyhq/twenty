import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  AgentChatMessageEntity,
  AgentChatMessageRole,
} from 'src/engine/metadata-modules/agent/agent-chat-message.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/agent/agent-chat-thread.entity';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/agent/agent.exception';

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

  async createThread(agentId: string, userWorkspaceId: string) {
    const thread = this.threadRepository.create({
      agentId,
      userWorkspaceId,
    });

    return this.threadRepository.save(thread);
  }

  async getThreadsForAgent(agentId: string, userWorkspaceId: string) {
    return this.threadRepository.find({
      where: {
        agentId,
        userWorkspaceId,
      },
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

  async getMessagesForThread(threadId: string, userWorkspaceId: string) {
    const thread = await this.threadRepository.findOne({
      where: {
        id: threadId,
        userWorkspaceId,
      },
    });

    if (!thread) {
      throw new AgentException(
        'Thread not found',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    return this.messageRepository.find({
      where: { threadId },
      order: { createdAt: 'ASC' },
    });
  }
}
