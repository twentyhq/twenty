import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ExtendedUIMessage } from 'twenty-shared/ai';
import { Repository } from 'typeorm';

import type { UIDataTypes, UIMessagePart, UITools } from 'ai';

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

  async createThread(userWorkspaceId: string) {
    const thread = this.threadRepository.create({
      userWorkspaceId,
    });

    return this.threadRepository.save(thread);
  }

  async getThreadsForUser(userWorkspaceId: string) {
    return this.threadRepository.find({
      where: {
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
    uiMessage: Omit<ExtendedUIMessage, 'id'>;
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

    // Only generate title from first user message
    if (uiMessage.role === AgentChatMessageRole.USER) {
      const messageContent = uiMessage.parts.find(
        (part) => part.type === 'text',
      )?.text;

      if (messageContent) {
        this.generateTitleIfNeeded(threadId, messageContent);
      }
    }

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
    messageContent: string,
  ) {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId },
      select: ['id', 'title'],
      relations: ['messages'],
    });

    if (!thread || thread.title || !messageContent) {
      return;
    }

    // Only generate title if this is the first user message
    const userMessageCount = thread.messages?.filter(
      (msg) => msg.role === AgentChatMessageRole.USER,
    ).length || 0;

    if (userMessageCount > 1) {
      return;
    }

    const title =
      await this.titleGenerationService.generateThreadTitle(messageContent);

    await this.threadRepository.update(threadId, { title });
  }
}
