import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Brackets, Repository, type SelectQueryBuilder } from 'typeorm';

import { ADMIN_CHAT_THREADS_MAX_PAGE_SIZE } from 'src/engine/core-modules/admin-panel/constants/admin-chat-threads-max-page-size.constant';
import { type AdminChatMessageDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-chat-message.dto';
import { type AdminChatThreadListItemDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-chat-thread-list-item.dto';
import { type AdminWorkspaceChatThreadDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-workspace-chat-thread.dto';
import { type PaginatedAdminChatThreadsDTO } from 'src/engine/core-modules/admin-panel/dtos/paginated-admin-chat-threads.dto';
import { AdminChatThreadScope } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-scope.enum';
import { AdminChatThreadSortDirection } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-sort-direction.enum';
import { AdminChatThreadSortField } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-sort-field.enum';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  AgentMessageEntity,
  AgentMessageRole,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { WORKSPACE_SETUP_CHAT_THREAD_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-chat-thread-id-namespace.constant';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const WORKSPACE_SETUP_THREAD_ID_EXPRESSION = `public.uuid_generate_v5(
  :setupThreadNamespace::uuid,
  "thread"."workspaceId"::text || ':' || "thread"."userWorkspaceId"::text
)`;

const ORDER_EXPRESSION_BY_SORT_FIELD: Record<AdminChatThreadSortField, string> =
  {
    [AdminChatThreadSortField.MESSAGE_COUNT]: '"messageCount"',
    [AdminChatThreadSortField.CREATED_AT]: '"thread"."createdAt"',
    [AdminChatThreadSortField.UPDATED_AT]: '"thread"."updatedAt"',
  };

type GlobalChatThreadsArgs = {
  scope: AdminChatThreadScope;
  hasErrorOnly: boolean;
  userNeverEngagedOnly: boolean;
  searchTerm?: string;
  sortBy: AdminChatThreadSortField;
  sortDirection: AdminChatThreadSortDirection;
  limit: number;
  offset: number;
};

type GlobalChatThreadRawRow = {
  id: string;
  title: string | null;
  workspaceId: string;
  workspaceDisplayName: string | null;
  userWorkspaceId: string;
  userEmail: string | null;
  userFirstName: string | null;
  userLastName: string | null;
  messageCount: number;
  userMessageCount: number;
  hasError: boolean;
  isOnboardingThread: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminPanelChatService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    // Thread lookup is by id alone; the admin does not know the workspaceId
    // upfront. assertWorkspaceAllowsImpersonation gates every other read, and
    // the global list enforces allowImpersonation as a join condition instead.
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

    if (!workspace) {
      throw new UserInputError('Workspace not found');
    }

    if (!workspace.allowImpersonation) {
      throw new UserInputError('This workspace has not enabled support access');
    }
  }

  private buildOnboardingThreadPredicate(
    queryBuilder: SelectQueryBuilder<AgentChatThreadEntity>,
  ): string {
    const hiddenKickoffMessageSubQuery = queryBuilder
      .subQuery()
      .select('1')
      .from(AgentMessageEntity, 'hiddenMessage')
      .where('hiddenMessage.threadId = thread.id')
      .andWhere('hiddenMessage.isHidden = true')
      .getQuery();

    return `(EXISTS (${hiddenKickoffMessageSubQuery}) OR "thread"."id" = ${WORKSPACE_SETUP_THREAD_ID_EXPRESSION})`;
  }

  private buildUserNeverEngagedPredicate(
    queryBuilder: SelectQueryBuilder<AgentChatThreadEntity>,
  ): string {
    const visibleUserMessageSubQuery = queryBuilder
      .subQuery()
      .select('1')
      .from(AgentMessageEntity, 'userMessage')
      .where('userMessage.threadId = thread.id')
      .andWhere('userMessage.isHidden = false')
      .andWhere('userMessage.role = :userMessageRole')
      .getQuery();

    return `NOT EXISTS (${visibleUserMessageSubQuery})`;
  }

  private applyGlobalChatThreadFilters(
    queryBuilder: SelectQueryBuilder<AgentChatThreadEntity>,
    {
      scope,
      hasErrorOnly,
      userNeverEngagedOnly,
      searchTerm,
    }: Pick<
      GlobalChatThreadsArgs,
      'scope' | 'hasErrorOnly' | 'userNeverEngagedOnly' | 'searchTerm'
    >,
  ): SelectQueryBuilder<AgentChatThreadEntity> {
    queryBuilder
      .innerJoin(
        'thread.workspace',
        'workspace',
        '"workspace"."allowImpersonation" = true AND "workspace"."deletedAt" IS NULL',
      )
      .leftJoin('thread.userWorkspace', 'userWorkspace')
      .leftJoin('userWorkspace.user', 'user')
      .withDeleted()
      .setParameter(
        'setupThreadNamespace',
        WORKSPACE_SETUP_CHAT_THREAD_ID_NAMESPACE,
      )
      .setParameter('userMessageRole', AgentMessageRole.USER);

    if (scope === AdminChatThreadScope.ONBOARDING) {
      queryBuilder.andWhere(this.buildOnboardingThreadPredicate(queryBuilder));
    }

    if (hasErrorOnly) {
      queryBuilder.andWhere('"thread"."lastStreamError" IS NOT NULL');
    }

    if (userNeverEngagedOnly) {
      queryBuilder.andWhere(this.buildUserNeverEngagedPredicate(queryBuilder));
    }

    const trimmedSearchTerm = searchTerm?.trim();

    if (trimmedSearchTerm) {
      const escapedSearchTerm = trimmedSearchTerm.replace(/[\\%_]/g, '\\$&');

      queryBuilder.andWhere(
        new Brackets((subQuery) => {
          subQuery
            .where('"workspace"."displayName" ILIKE :searchPattern')
            .orWhere('"user"."email" ILIKE :searchPattern')
            .orWhere('"thread"."id"::text ILIKE :searchPattern');
        }),
        { searchPattern: `%${escapedSearchTerm}%` },
      );
    }

    return queryBuilder;
  }

  async getGlobalChatThreads({
    scope,
    hasErrorOnly,
    userNeverEngagedOnly,
    searchTerm,
    sortBy,
    sortDirection,
    limit,
    offset,
  }: GlobalChatThreadsArgs): Promise<PaginatedAdminChatThreadsDTO> {
    const sanitizedLimit = Math.min(
      Math.max(limit, 1),
      ADMIN_CHAT_THREADS_MAX_PAGE_SIZE,
    );
    const sanitizedOffset = Math.max(offset, 0);

    const filterArgs = {
      scope,
      hasErrorOnly,
      userNeverEngagedOnly,
      searchTerm,
    };

    const orderExpression = ORDER_EXPRESSION_BY_SORT_FIELD[sortBy];

    const orderDirection: 'ASC' | 'DESC' =
      sortDirection === AdminChatThreadSortDirection.ASC ? 'ASC' : 'DESC';

    const listQueryBuilder = this.applyGlobalChatThreadFilters(
      this.agentChatThreadRepository.createQueryBuilder('thread'),
      filterArgs,
    );

    const rows = await listQueryBuilder
      .leftJoin('thread.messages', 'message', '"message"."isHidden" = false')
      .select('thread.id', 'id')
      .addSelect('thread.title', 'title')
      .addSelect('thread.workspaceId', 'workspaceId')
      .addSelect('thread.userWorkspaceId', 'userWorkspaceId')
      .addSelect('thread.deletedAt', 'deletedAt')
      .addSelect('thread.createdAt', 'createdAt')
      .addSelect('thread.updatedAt', 'updatedAt')
      .addSelect('workspace.displayName', 'workspaceDisplayName')
      .addSelect('user.email', 'userEmail')
      .addSelect('user.firstName', 'userFirstName')
      .addSelect('user.lastName', 'userLastName')
      .addSelect('"thread"."lastStreamError" IS NOT NULL', 'hasError')
      .addSelect(
        this.buildOnboardingThreadPredicate(listQueryBuilder),
        'isOnboardingThread',
      )
      .addSelect('COUNT("message"."id")::int', 'messageCount')
      .addSelect(
        `(COUNT("message"."id") FILTER (WHERE "message"."role" = 'user'))::int`,
        'userMessageCount',
      )
      .groupBy('"thread"."id"')
      .addGroupBy('"workspace"."id"')
      .addGroupBy('"userWorkspace"."id"')
      .addGroupBy('"user"."id"')
      .orderBy(orderExpression, orderDirection)
      .addOrderBy('"thread"."id"', 'ASC')
      .limit(sanitizedLimit)
      .offset(sanitizedOffset)
      .getRawMany<GlobalChatThreadRawRow>();

    const totalCount = await this.applyGlobalChatThreadFilters(
      this.agentChatThreadRepository.createQueryBuilder('thread'),
      filterArgs,
    ).getCount();

    const threads: AdminChatThreadListItemDTO[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      workspaceId: row.workspaceId,
      workspaceDisplayName: row.workspaceDisplayName,
      userWorkspaceId: row.userWorkspaceId,
      userEmail: row.userEmail,
      userFirstName: row.userFirstName,
      userLastName: row.userLastName,
      messageCount: row.messageCount,
      userMessageCount: row.userMessageCount,
      hasError: row.hasError,
      isOnboardingThread: row.isOnboardingThread,
      deletedAt: row.deletedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    return {
      threads,
      totalCount,
      hasMore: sanitizedOffset + threads.length < totalCount,
    };
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
    if (threadIds.length === 0) {
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

    if (!thread) {
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
