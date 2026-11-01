import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type AdminChatMessageDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-chat-message.dto';
import { type AdminWorkspaceChatThreadDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-workspace-chat-thread.dto';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

@Injectable()
export class AdminPanelChatService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly agentChatThreadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly agentMessageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
  ) {}

  private async assertWorkspaceAllowsImpersonation(
    workspaceId: string,
  ): Promise<void> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: { id: true, allowImpersonation: true },
    });

    if (!isDefined(workspace)) {
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

    const threads = await this.agentChatThreadRepository.find(workspaceId, {
      order: { updatedAt: 'DESC' },
      take: 100,
    });

    const messageCountByThreadId = await this.getMessageCountByThreadId({
      workspaceId,
      threadIds: threads.map((thread) => thread.id),
    });

    return threads.map((thread) => ({
      id: thread.id,
      title: thread.title,
      totalInputTokens: thread.totalInputTokens,
      totalOutputTokens: thread.totalOutputTokens,
      conversationSize: thread.conversationSize,
      messageCount: messageCountByThreadId.get(thread.id) ?? 0,
      createdAt: new Date(thread.createdAt),
      updatedAt: new Date(thread.updatedAt),
    }));
  }

  private async getMessageCountByThreadId({
    workspaceId,
    threadIds,
  }: {
    workspaceId: string;
    threadIds: string[];
  }): Promise<Map<string, number>> {
    if (!isNonEmptyArray(threadIds)) {
      return new Map();
    }

    const rows = await this.agentMessageRepository.query(
      workspaceId,
      ({ manager, table }) =>
        manager.query<{ threadId: string; messageCount: number }[]>(
          `SELECT "threadId", COUNT(*)::int AS "messageCount" FROM ${table('agentMessage')}
       WHERE "threadId" = ANY($1::uuid[]) AND role <> 'system'
       GROUP BY "threadId"`,
          [threadIds],
        ),
    );

    return new Map(rows.map((row) => [row.threadId, row.messageCount]));
  }

  async getChatThreadMessages({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<{
    thread: AdminWorkspaceChatThreadDTO;
    messages: AdminChatMessageDTO[];
  }> {
    await this.assertWorkspaceAllowsImpersonation(workspaceId);

    const thread = await this.agentChatThreadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });

    if (!isDefined(thread)) {
      throw new UserInputError('Thread not found');
    }

    const messages = await this.agentMessageRepository.find(workspaceId, {
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
        messageCount: messages.filter(
          (message) => message.role !== AgentMessageRole.SYSTEM,
        ).length,
        createdAt: new Date(thread.createdAt),
        updatedAt: new Date(thread.updatedAt),
      },
      messages: messages.map((message) => ({
        id: message.id,
        role: message.role,
        parts: (message.parts ?? [])
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((part) => ({
            type: part.type,
            orderIndex: part.orderIndex,
            textContent: part.textContent,
            reasoningContent: part.reasoningContent,
            toolName: part.toolName,
            toolCallId: part.toolCallId,
            toolInput: part.toolInput,
            toolOutput: part.toolOutput,
            state: part.state,
            errorMessage: part.errorMessage,
          })),
        createdAt: new Date(message.createdAt),
      })),
    };
  }
}
