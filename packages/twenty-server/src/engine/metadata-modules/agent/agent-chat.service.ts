import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import type { UIMessage, UIMessagePart } from 'ai';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { AgentChatMessagePartEntity } from 'src/engine/metadata-modules/agent/agent-chat-message-part.entity';
import {
  AgentChatMessageEntity,
  type AgentChatMessageRole,
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
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
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
    fileIds,
  }: {
    threadId: string;
    uiMessage: Omit<UIMessage, 'id'>;
    uiMessageParts?: UIMessagePart<never, never>[];
    fileIds?: string[];
  }) {
    const message = this.messageRepository.create({
      threadId,
      role: uiMessage.role as AgentChatMessageRole,
    });

    const savedMessage = await this.messageRepository.save(message);

    if (uiMessage.parts && uiMessage.parts.length > 0) {
      const dbParts = mapUIMessagePartsToDBParts(
        uiMessage.parts as UIMessagePart<never, never>[],
        savedMessage.id,
      );

      await this.messagePartRepository.save(dbParts);
    }

    if (fileIds && fileIds.length > 0) {
      for (const fileId of fileIds) {
        await this.fileRepository.update(fileId, {
          messageId: savedMessage.id,
        });
      }
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
      relations: ['parts', 'files'],
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
