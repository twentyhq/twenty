import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ASK_QUESTION_TOOL_NAME,
  ASK_QUESTIONS_TOOL_NAME,
} from 'twenty-shared/ai';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentHistoryWorkspaceStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';
import { ADMIN_CHAT_THREADS_MAX_PAGE_SIZE } from 'src/engine/core-modules/admin-panel/constants/admin-chat-threads-max-page-size.constant';
import { type PaginatedAdminChatThreadsDTO } from 'src/engine/core-modules/admin-panel/dtos/paginated-admin-chat-threads.dto';
import { AdminChatThreadScope } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-scope.enum';
import { AdminChatThreadSortDirection } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-sort-direction.enum';
import { AdminChatThreadSortField } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-sort-field.enum';
import { WORKSPACE_SETUP_CHAT_THREAD_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-chat-thread-id-namespace.constant';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

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
  userWorkspaceId: string | null;
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

const COLUMN_BY_SORT_FIELD: Record<
  AdminChatThreadSortField,
  'messageCount' | 'userReplyCount' | 'createdAt' | 'updatedAt'
> = {
  [AdminChatThreadSortField.MESSAGE_COUNT]: 'messageCount',
  [AdminChatThreadSortField.REPLY_COUNT]: 'userReplyCount',
  [AdminChatThreadSortField.CREATED_AT]: 'createdAt',
  [AdminChatThreadSortField.UPDATED_AT]: 'updatedAt',
};

@Injectable()
export class AdminPanelGlobalChatThreadsService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @Inject(AgentHistoryWorkspaceStorageService)
    private readonly historyStorage: Pick<
      AgentHistoryWorkspaceStorageService,
      'runReadOnlyReport'
    >,
  ) {}

  async getGlobalChatThreads(
    args: GlobalChatThreadsArgs,
  ): Promise<PaginatedAdminChatThreadsDTO> {
    const limit = Math.min(
      Math.max(args.limit, 1),
      ADMIN_CHAT_THREADS_MAX_PAGE_SIZE,
    );
    const offset = Math.max(args.offset, 0);
    const field = COLUMN_BY_SORT_FIELD[args.sortBy];
    const direction =
      args.sortDirection === AdminChatThreadSortDirection.ASC ? 1 : -1;
    const workspaces = await this.workspaceRepository.find({
      where: { allowImpersonation: true },
      select: { id: true },
      order: { id: 'ASC' },
    });
    let candidates: GlobalChatThreadRawRow[] = [];
    let totalCount = 0;
    const compare = (
      left: GlobalChatThreadRawRow,
      right: GlobalChatThreadRawRow,
    ) => {
      const leftValue = Number(left[field]);
      const rightValue = Number(right[field]);
      return (
        direction * (leftValue - rightValue) || left.id.localeCompare(right.id)
      );
    };

    await this.historyStorage.runReadOnlyReport(
      workspaces.map((workspace) => workspace.id),
      async ({ manager, partitions }) => {
        for (
          let offsetIndex = 0;
          offsetIndex < partitions.length;
          offsetIndex += 25
        ) {
          const parameters: unknown[] = [];
          const queries = partitions
            .slice(offsetIndex, offsetIndex + 25)
            .map(({ workspaceIds, table }, partitionIndex) => {
              const search = args.searchTerm?.trim().replace(/[\\%_]/g, '\\$&');
              assertIsDefinedOrThrow(workspaceIds[0]);

              const query = `
          WITH candidates AS (
            SELECT thread.id, thread.title, workspace.id AS "workspaceId", workspace."displayName" AS "workspaceDisplayName",
              membership.id AS "userWorkspaceId", owner.email AS "userEmail", owner."firstName" AS "userFirstName", owner."lastName" AS "userLastName",
              thread."deletedAt", thread."createdAt", thread."updatedAt", COALESCE((SELECT turn.status = '${AgentTurnStatus.FAILED}' FROM ${table('agentTurn')} turn WHERE turn."threadId" = thread.id ORDER BY turn."createdAt" DESC, turn.id DESC LIMIT 1), false) AS "hasError",
              (EXISTS (SELECT 1 FROM ${table('agentMessage')} context WHERE context."threadId" = thread.id AND (context.role = 'system' OR context."isHidden" = true))
                OR (membership.id IS NOT NULL AND thread.id = public.uuid_generate_v5($2::uuid, workspace.id::text || ':' || membership.id::text))) AS "isOnboardingThread",
              (SELECT COUNT(*)::int FROM ${table('agentMessage')} message WHERE message."threadId" = thread.id AND message."isHidden" = false AND message.role <> 'system') AS "messageCount",
              ((SELECT COUNT(*) FROM ${table('agentMessage')} message WHERE message."threadId" = thread.id AND message."isHidden" = false AND message.role = 'user')
                + (SELECT COUNT(*) FROM ${table('agentMessagePart')} part JOIN ${table('agentMessage')} message ON message.id = part."messageId"
                   WHERE message."threadId" = thread.id AND message."isHidden" = false AND part."toolName" = ANY($3::text[]) AND part."toolOutput"->'result'->>'status' = 'answered'))::int AS "userReplyCount"
            FROM ${table('agentChatThread')} thread
            JOIN core.workspace workspace ON workspace.id = ANY($1::uuid[]) AND workspace."allowImpersonation" = true AND workspace."deletedAt" IS NULL
            LEFT JOIN ${escapeIdentifier(getWorkspaceSchemaName(workspaceIds[0]))}."workspaceMember" member ON member.id = thread."workspaceMemberId"
            LEFT JOIN core."userWorkspace" membership ON membership."userId" = member."userId" AND membership."workspaceId" = workspace.id AND membership."deletedAt" IS NULL
            LEFT JOIN core."user" owner ON owner.id = member."userId"
            WHERE true
              AND ($4::text IS NULL OR workspace."displayName" ILIKE $4 OR owner.email ILIKE $4 OR thread.id::text ILIKE $4)
          )
          SELECT *, COUNT(*) OVER () AS "totalCount", $9::int AS "partitionIndex" FROM candidates
          WHERE ($5::boolean = false OR "isOnboardingThread") AND ($6::boolean = false OR "hasError") AND ($7::boolean = false OR "userReplyCount" = 0)
          ORDER BY "${field}" ${direction === 1 ? 'ASC' : 'DESC'}, id ASC LIMIT $8`;
              const parameterOffset = parameters.length;
              parameters.push(
                workspaceIds,
                WORKSPACE_SETUP_CHAT_THREAD_ID_NAMESPACE,
                [ASK_QUESTION_TOOL_NAME, ASK_QUESTIONS_TOOL_NAME],
                search ? `%${search}%` : null,
                args.scope === AdminChatThreadScope.ONBOARDING,
                args.hasErrorOnly,
                args.userNeverEngagedOnly,
                offset + limit,
                partitionIndex,
              );
              return `(${query.replace(/\$(\d+)/g, (_, position: string) => `$${Number(position) + parameterOffset}`)})`;
            });
          const rows = await manager.query<
            (GlobalChatThreadRawRow & {
              totalCount: string;
              partitionIndex: number;
            })[]
          >(queries.join(' UNION ALL '), parameters);
          totalCount += [
            ...new Map(
              rows.map((row) => [row.partitionIndex, Number(row.totalCount)]),
            ).values(),
          ].reduce((total, count) => total + count, 0);
          candidates = [...candidates, ...rows]
            .sort(compare)
            .slice(0, offset + limit);
        }
      },
    );
    const threads = candidates.slice(offset, offset + limit);
    return {
      threads,
      totalCount,
      hasMore: offset + threads.length < totalCount,
    };
  }
}
