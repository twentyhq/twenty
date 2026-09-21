import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
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
import { AgentMessageEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';

@Injectable()
export class AdminPanelChatService {
  constructor(
    private readonly historyStorage: AgentHistoryStorageService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly agentChatThreadRepository: AgentHistoryRepository<AgentChatThreadEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly agentMessageRepository: AgentHistoryRepository<AgentMessageEntity>,
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

    const rows = await this.agentMessageRepository.query(
      workspaceId,
      ({ manager, table, storage }) =>
        manager.query<{ threadId: string; messageCount: number }[]>(
          `SELECT "threadId", COUNT(*)::int AS "messageCount" FROM ${table('agentMessage')}
       WHERE "threadId" = ANY($1::uuid[]) AND "isHidden" = false ${storage === 'core' ? 'AND "workspaceId" = $2' : ''}
       GROUP BY "threadId"`,
          storage === 'core' ? [threadIds, workspaceId] : [threadIds],
        ),
    );

    return new Map(rows.map((row) => [row.threadId, row.messageCount]));
  }

  async getChatThreadMessages(threadId: string): Promise<{
    thread: AdminWorkspaceChatThreadDTO;
    messages: AdminChatMessageDTO[];
  }> {
    const workspaces = await this.workspaceRepository.find({
      where: { allowImpersonation: true },
      select: { id: true },
    });
    const workspaceId = await this.historyStorage.runReadOnlyReport(
      workspaces.map((workspace) => workspace.id),
      async ({ manager, partitions }) => {
        for (let offset = 0; offset < partitions.length; offset += 25) {
          const parameters: unknown[] = [threadId];
          const queries = partitions
            .slice(offset, offset + 25)
            .map(({ workspaceIds, storage, table }) => {
              parameters.push(workspaceIds);
              return `(SELECT workspace.id AS "workspaceId"
                FROM ${table('agentChatThread')} thread
                JOIN core.workspace workspace ON workspace.id = ANY($${parameters.length}::uuid[])
                  AND workspace."allowImpersonation" = true AND workspace."deletedAt" IS NULL
                  ${storage === 'core' ? 'AND thread."workspaceId" = workspace.id' : ''}
                WHERE thread.id = $1 LIMIT 1)`;
            });
          const matches = await manager.query<{ workspaceId: string }[]>(
            `SELECT * FROM (${queries.join(' UNION ALL ')}) matches LIMIT 1`,
            parameters,
          );
          if (isNonEmptyArray(matches)) {
            return matches[0].workspaceId;
          }
        }
        return null;
      },
    );
    const thread = isDefined(workspaceId)
      ? await this.agentChatThreadRepository.findOne(workspaceId, {
          where: { id: threadId },
        })
      : null;

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
