import { AgentHistoryWorkspaceStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  isDefined,
  isNonEmptyArray,
  isNonEmptyString,
} from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type AdminChatMessageDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-chat-message.dto';
import { type AdminChatTurnContextDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-chat-turn-context.dto';
import { type AdminWorkspaceChatThreadDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-workspace-chat-thread.dto';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

@Injectable()
export class AdminPanelChatService {
  constructor(
    @Inject(AgentHistoryWorkspaceStorageService)
    private readonly historyStorage: Pick<
      AgentHistoryWorkspaceStorageService,
      'runReadOnlyReport'
    >,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly agentChatThreadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly agentMessageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentTurn')
    private readonly agentTurnRepository: AgentHistoryRepository<AgentTurnWorkspaceEntity>,
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
       WHERE "threadId" = ANY($1::uuid[])
       GROUP BY "threadId"`,
          [threadIds],
        ),
    );

    return new Map(rows.map((row) => [row.threadId, row.messageCount]));
  }

  async getChatThreadMessages(threadId: string): Promise<{
    thread: AdminWorkspaceChatThreadDTO;
    messages: AdminChatMessageDTO[];
    contexts: AdminChatTurnContextDTO[];
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
            .map(({ workspaceIds, table }) => {
              parameters.push(workspaceIds);
              return `(SELECT workspace.id AS "workspaceId"
                FROM ${table('agentChatThread')} thread
                JOIN core.workspace workspace ON workspace.id = ANY($${parameters.length}::uuid[])
                  AND workspace."allowImpersonation" = true AND workspace."deletedAt" IS NULL
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

    if (!isDefined(thread) || !isDefined(workspaceId)) {
      throw new UserInputError('Thread not found');
    }

    await this.assertWorkspaceAllowsImpersonation(workspaceId);

    const [messages, turns] = await Promise.all([
      this.agentMessageRepository.find(workspaceId, {
        where: { threadId },
        relations: { parts: true },
        order: { createdAt: 'ASC' },
      }),
      this.agentTurnRepository.find(workspaceId, {
        where: { threadId },
        order: { createdAt: 'ASC' },
      }),
    ]);

    return {
      thread: {
        id: thread.id,
        title: thread.title,
        totalInputTokens: thread.totalInputTokens,
        totalOutputTokens: thread.totalOutputTokens,
        conversationSize: thread.conversationSize,
        messageCount: messages.length,
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
      contexts: turns.flatMap(({ context, createdAt }) =>
        isNonEmptyString(context)
          ? [{ context, createdAt: new Date(createdAt) }]
          : [],
      ),
    };
  }
}
