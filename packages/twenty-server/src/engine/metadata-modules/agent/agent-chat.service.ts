import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import {
  AgentChatMessageEntity,
  AgentChatMessageRole,
} from 'src/engine/metadata-modules/agent/agent-chat-message.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/agent/agent-chat-thread.entity';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/agent/agent.exception';

import { AgentTitleGenerationService } from './agent-title-generation.service';

@Injectable()
export class AgentChatService {
  constructor(
    @InjectRepository(AgentChatThreadEntity, 'core')
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
    @InjectRepository(AgentChatMessageEntity, 'core')
    private readonly messageRepository: Repository<AgentChatMessageEntity>,
    @InjectRepository(FileEntity, 'core')
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
    role,
    content,
    fileIds,
  }: {
    threadId: string;
    role: AgentChatMessageRole;
    content: string;
    fileIds?: string[];
  }) {
    const message = this.messageRepository.create({
      threadId,
      role,
      content,
    });

    const savedMessage = await this.messageRepository.save(message);

    if (fileIds && fileIds.length > 0) {
      for (const fileId of fileIds) {
        await this.fileRepository.update(fileId, {
          messageId: savedMessage.id,
        });
      }
    }

    this.generateTitleIfNeeded(threadId, content);

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
      relations: ['files'],
    });
  }

  private async generateTitleIfNeeded(
    threadId: string,
    messageContent: string,
  ) {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId },
      select: ['id', 'title'],
    });

    if (!thread || thread.title) {
      return;
    }

    const title =
      await this.titleGenerationService.generateThreadTitle(messageContent);

    await this.threadRepository.update(threadId, { title });
  }
}
