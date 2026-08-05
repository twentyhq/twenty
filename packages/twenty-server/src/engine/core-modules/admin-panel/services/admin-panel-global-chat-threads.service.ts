import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  ASK_QUESTIONS_TOOL_NAME,
  type AskQuestionsToolStatus,
} from 'twenty-shared/ai';
import { Brackets, Repository, type SelectQueryBuilder } from 'typeorm';

import { ADMIN_CHAT_THREADS_MAX_PAGE_SIZE } from 'src/engine/core-modules/admin-panel/constants/admin-chat-threads-max-page-size.constant';
import { type AdminChatThreadListItemDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-chat-thread-list-item.dto';
import { type PaginatedAdminChatThreadsDTO } from 'src/engine/core-modules/admin-panel/dtos/paginated-admin-chat-threads.dto';
import { AdminChatThreadScope } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-scope.enum';
import { AdminChatThreadSortDirection } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-sort-direction.enum';
import { AdminChatThreadSortField } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-sort-field.enum';
import { AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import {
  AgentMessageEntity,
  AgentMessageRole,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { WORKSPACE_SETUP_CHAT_THREAD_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-chat-thread-id-namespace.constant';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';

const WORKSPACE_SETUP_THREAD_ID_EXPRESSION = `public.uuid_generate_v5(
  :setupThreadNamespace::uuid,
  "thread"."workspaceId"::text || ':' || "thread"."userWorkspaceId"::text
)`;

const ANSWERED_ASK_QUESTIONS_STATUS: AskQuestionsToolStatus = 'answered';

// Answering an ask_questions card creates no agentMessage row: the answer is an
// in-place update of the assistant part's toolOutput, and the part's state is
// left untouched, so the JSONB status is the only discriminator. Identifiers
// are pre-quoted because TypeORM's alias replacer would otherwise swallow the
// JSON operators and leave the alias unquoted.
const ANSWERED_ASK_QUESTIONS_PART_EXPRESSION = `"answeredQuestionPart"."toolOutput" -> 'result' ->> 'status' = :answeredQuestionStatus`;

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
  userReplyCount: number;
  hasError: boolean;
  isOnboardingThread: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminPanelGlobalChatThreadsService {
  constructor(
    // The list spans every workspace, so it cannot use a workspace-scoped
    // repository; allowImpersonation is enforced as a join condition instead.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(AgentChatThreadEntity)
    private readonly agentChatThreadRepository: Repository<AgentChatThreadEntity>,
  ) {}

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

  private buildAnsweredQuestionSubQuery(
    queryBuilder: SelectQueryBuilder<AgentChatThreadEntity>,
    selection: string,
  ): string {
    return queryBuilder
      .subQuery()
      .select(selection)
      .from(AgentMessagePartEntity, 'answeredQuestionPart')
      .innerJoin(
        AgentMessageEntity,
        'questionMessage',
        'questionMessage.id = answeredQuestionPart.messageId',
      )
      .where('questionMessage.threadId = thread.id')
      .andWhere('questionMessage.isHidden = false')
      .andWhere('answeredQuestionPart.toolName = :askQuestionsToolName')
      .andWhere(ANSWERED_ASK_QUESTIONS_PART_EXPRESSION)
      .getQuery();
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

    const answeredQuestionSubQuery = this.buildAnsweredQuestionSubQuery(
      queryBuilder,
      '1',
    );

    return `(NOT EXISTS (${visibleUserMessageSubQuery}) AND NOT EXISTS (${answeredQuestionSubQuery}))`;
  }

  private applyFilters(
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
      .setParameter('userMessageRole', AgentMessageRole.USER)
      .setParameter('askQuestionsToolName', ASK_QUESTIONS_TOOL_NAME)
      .setParameter('answeredQuestionStatus', ANSWERED_ASK_QUESTIONS_STATUS);

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

    const listQueryBuilder = this.applyFilters(
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
        `(
          (COUNT("message"."id") FILTER (WHERE "message"."role" = :userMessageRole))
          + (${this.buildAnsweredQuestionSubQuery(listQueryBuilder, 'COUNT(*)')})
        )::int`,
        'userReplyCount',
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

    const totalCount = await this.applyFilters(
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
      userReplyCount: row.userReplyCount,
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
}
