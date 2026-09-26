import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ASK_QUESTIONS_TOOL_NAME } from 'twenty-shared/ai';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { ADMIN_CHAT_THREADS_MAX_PAGE_SIZE } from 'src/engine/core-modules/admin-panel/constants/admin-chat-threads-max-page-size.constant';
import { type PaginatedAdminChatThreadsDTO } from 'src/engine/core-modules/admin-panel/dtos/paginated-admin-chat-threads.dto';
import { AdminChatThreadScope } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-scope.enum';
import { AdminChatThreadSortDirection } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-sort-direction.enum';
import { AdminChatThreadSortField } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-sort-field.enum';
import { WORKSPACE_SETUP_CHAT_THREAD_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-chat-thread-id-namespace.constant';

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
    private readonly historyStorage: AgentHistoryStorageService,
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
        // Bound each statement's size and keep only the global page candidates.
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
              const query = `
          WITH candidates AS (
            SELECT thread.id, thread.title, workspace.id AS "workspaceId", workspace."displayName" AS "workspaceDisplayName",
              thread."userWorkspaceId", owner.email AS "userEmail", owner."firstName" AS "userFirstName", owner."lastName" AS "userLastName",
              thread."archivedAt" AS "deletedAt", thread."createdAt", thread."updatedAt", thread."lastStreamError" IS NOT NULL AS "hasError",
              (EXISTS (SELECT 1 FROM ${table('agentMessage')} hidden WHERE hidden."threadId" = thread.id AND hidden."isHidden" = true)
                OR thread.id = public.uuid_generate_v5($2::uuid, workspace.id::text || ':' || thread."userWorkspaceId"::text)) AS "isOnboardingThread",
              (SELECT COUNT(*)::int FROM ${table('agentMessage')} message WHERE message."threadId" = thread.id AND message."isHidden" = false) AS "messageCount",
              ((SELECT COUNT(*) FROM ${table('agentMessage')} message WHERE message."threadId" = thread.id AND message."isHidden" = false AND message.role = 'user')
                + (SELECT COUNT(*) FROM ${table('agentMessagePart')} part JOIN ${table('agentMessage')} message ON message.id = part."messageId"
                   WHERE message."threadId" = thread.id AND message."isHidden" = false AND part."toolName" = $3 AND part."toolOutput"->'result'->>'status' = 'answered'))::int AS "userReplyCount"
            FROM ${table('agentChatThread')} thread
            JOIN core.workspace workspace ON workspace.id = ANY($1::uuid[]) AND workspace."allowImpersonation" = true AND workspace."deletedAt" IS NULL
            LEFT JOIN core."userWorkspace" membership ON membership.id = thread."userWorkspaceId" AND membership."workspaceId" = workspace.id
            LEFT JOIN core."user" owner ON owner.id = membership."userId"
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
                ASK_QUESTIONS_TOOL_NAME,
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
