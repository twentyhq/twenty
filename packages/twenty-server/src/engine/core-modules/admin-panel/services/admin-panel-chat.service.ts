import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { type AdminChatMessageDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-chat-message.dto';
import { type AdminWorkspaceChatThreadDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-workspace-chat-thread.dto';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentMessageEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';

@Injectable()
export class AdminPanelChatService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(AgentChatThreadEntity)
    private readonly agentChatThreadRepository: Repository<AgentChatThreadEntity>,
    @InjectRepository(AgentMessageEntity)
    private readonly agentMessageRepository: Repository<AgentMessageEntity>,
  ) {}

  private async assertWorkspaceAllowsImpersonation(
    workspaceId: string,
  ): Promise<void> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: { id: true, allowImpersonation: true },
    });

    if (!workspace) {
      throw new UserInputError('Workspace not found');
    }

    if (!workspace.allowImpersonation) {
      throw new UserInputError('This workspace has not enabled support access');
    }
  }

  async getWorkspaceChatThreads(
    workspaceId: string,
  ): Promise<AdminWorkspaceChatThreadDTO[]> {
    await this.assertWorkspaceAllowsImpersonation(workspaceId);

    const threads = await this.agentChatThreadRepository.find({
      where: { workspaceId },
      order: { updatedAt: 'DESC' },
      take: 100,
    });

    return threads.map((thread) => ({
      id: thread.id,
      title: thread.title,
      totalInputTokens: thread.totalInputTokens,
      totalOutputTokens: thread.totalOutputTokens,
      conversationSize: thread.conversationSize,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    }));
  }

  async getChatThreadMessages(threadId: string): Promise<{
    thread: AdminWorkspaceChatThreadDTO;
    messages: AdminChatMessageDTO[];
  }> {
    const thread = await this.agentChatThreadRepository.findOne({
      where: { id: threadId },
    });

    if (!thread) {
      throw new UserInputError('Thread not found');
    }

    await this.assertWorkspaceAllowsImpersonation(thread.workspaceId);

    const messages = await this.agentMessageRepository.find({
      where: { threadId },
      relations: { parts: true },
      order: { createdAt: 'ASC' },
    });

    return {
      thread: {
        id: thread.id,
        title: thread.title,
        totalInputTokens: thread.totalInputTokens,
        totalOutputTokens: thread.totalOutputTokens,
        conversationSize: thread.conversationSize,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
      },
      messages: messages.map((message) => ({
        id: message.id,
        role: message.role,
        parts: (message.parts ?? [])
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((part) => ({
            type: part.type,
            textContent: part.textContent,
            toolName: part.toolName,
          })),
        createdAt: message.createdAt,
      })),
    };
  }
}
