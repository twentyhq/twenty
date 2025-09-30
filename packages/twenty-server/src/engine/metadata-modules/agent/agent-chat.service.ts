import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import type { UIDataTypes, UIMessage, UIMessagePart, UITools } from 'ai';

import { AgentChatMessagePartEntity } from 'src/engine/metadata-modules/agent/agent-chat-message-part.entity';
import {
  AgentChatMessageEntity,
  AgentChatMessageRole,
} from 'src/engine/metadata-modules/agent/agent-chat-message.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/agent/agent-chat-thread.entity';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/agent/agent.exception';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/agent/utils/mapUIMessagePartsToDBParts';

import { AgentTitleGenerationService } from './agent-title-generation.service';

@Injectable()
export class AgentChatService {
  constructor(
    @InjectRepository(AgentChatThreadEntity)
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
    @InjectRepository(AgentChatMessageEntity)
    private readonly messageRepository: Repository<AgentChatMessageEntity>,
    @InjectRepository(AgentChatMessagePartEntity)
    private readonly messagePartRepository: Repository<AgentChatMessagePartEntity>,
    private readonly titleGenerationService: AgentTitleGenerationService,
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

  async getThreadById(threadId: string, userWorkspaceId: string) {
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

    return thread;
  }

  async addMessage({
    threadId,
    uiMessage,
  }: {
    threadId: string;
    uiMessage: Omit<UIMessage<unknown, UIDataTypes, UITools>, 'id'>;
    uiMessageParts?: UIMessagePart<UIDataTypes, UITools>[];
  }) {
    const message = this.messageRepository.create({
      threadId,
      role: uiMessage.role as AgentChatMessageRole,
    });

    const savedMessage = await this.messageRepository.save(message);

    if (uiMessage.parts && uiMessage.parts.length > 0) {
      const dbParts = mapUIMessagePartsToDBParts(
        uiMessage.parts,
        savedMessage.id,
      );

      await this.messagePartRepository.save(dbParts);
    }

    this.generateTitleIfNeeded(
      threadId,
      uiMessage.parts.find((part) => part.type === 'text')?.text,
    );

    return savedMessage;
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
      relations: ['parts'],
    });
  }

  private async generateTitleIfNeeded(
    threadId: string,
    messageContent?: string | null,
  ) {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId },
      select: ['id', 'title'],
    });

    if (!thread || thread.title || !messageContent) {
      return;
    }

    const title =
      await this.titleGenerationService.generateThreadTitle(messageContent);

    await this.threadRepository.update(threadId, { title });
  }
}
