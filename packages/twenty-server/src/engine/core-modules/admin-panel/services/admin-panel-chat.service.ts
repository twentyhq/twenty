import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type AdminChatMessageDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-chat-message.dto';
import { type AdminWorkspaceChatThreadDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-workspace-chat-thread.dto';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentMessageEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class AdminPanelChatService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    // Thread lookup is by id alone; the admin does not know the workspaceId
    // upfront. assertWorkspaceAllowsImpersonation gates every other read.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(AgentChatThreadEntity)
    private readonly agentChatThreadRepository: Repository<AgentChatThreadEntity>,
    @InjectWorkspaceScopedRepository(AgentMessageEntity)
    private readonly agentMessageRepository: WorkspaceScopedRepository<AgentMessageEntity>,
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

    const threads = await this.agentChatThreadRepository.find({
      where: { workspaceId },
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
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
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

    // Query builder uses the scoped wrapper's escape hatch; we add the
    // workspaceId predicate manually below.
    const rows = await this.agentMessageRepository
      .createQueryBuilder('message')
      .select('"message"."threadId"', 'threadId')
      .addSelect('COUNT(*)::int', 'messageCount')
      .where(
        '"message"."workspaceId" = :workspaceId AND "message"."threadId" IN (:...threadIds) AND "message"."isHidden" = false',
        { workspaceId, threadIds },
      )
      .groupBy('"message"."threadId"')
      .getRawMany<{ threadId: string; messageCount: number }>();

    return new Map(rows.map((row) => [row.threadId, row.messageCount]));
  }

  async getChatThreadMessages(threadId: string): Promise<{
    thread: AdminWorkspaceChatThreadDTO;
    messages: AdminChatMessageDTO[];
  }> {
    const thread = await this.agentChatThreadRepository.findOne({
      where: { id: threadId },
    });

    if (!isDefined(thread)) {
      throw new UserInputError('Thread not found');
    }

    await this.assertWorkspaceAllowsImpersonation(thread.workspaceId);

    const messages = await this.agentMessageRepository.find(
      thread.workspaceId,
      {
        where: { threadId },
        relations: { parts: true },
        order: { createdAt: 'ASC' },
      },
    );

    return {
      thread: {
        id: thread.id,
        title: thread.title,
        totalInputTokens: thread.totalInputTokens,
        totalOutputTokens: thread.totalOutputTokens,
        conversationSize: thread.conversationSize,
        messageCount: messages.filter((message) => !message.isHidden).length,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
      },
      messages: messages.map((message) => ({
        id: message.id,
        role: message.role,
        isHidden: message.isHidden,
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
        createdAt: message.createdAt,
      })),
    };
  }
}
