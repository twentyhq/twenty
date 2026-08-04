import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Brackets } from 'typeorm';

import { AdminChatThreadScope } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-scope.enum';
import { AdminChatThreadSortDirection } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-sort-direction.enum';
import { AdminChatThreadSortField } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-sort-field.enum';
import { AdminPanelChatService } from 'src/engine/core-modules/admin-panel/services/admin-panel-chat.service';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  AgentMessageEntity,
  AgentMessageRole,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { WORKSPACE_SETUP_CHAT_THREAD_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-chat-thread-id-namespace.constant';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const QUERY_BUILDER_CHAINABLE_METHODS = [
  'innerJoin',
  'leftJoin',
  'withDeleted',
  'setParameter',
  'where',
  'andWhere',
  'select',
  'addSelect',
  'groupBy',
  'addGroupBy',
  'orderBy',
  'addOrderBy',
  'limit',
  'offset',
] as const;

const SUB_QUERY_BUILDER_CHAINABLE_METHODS = [
  'select',
  'from',
  'where',
  'andWhere',
] as const;

type SubQueryBuilderMock = Record<
  (typeof SUB_QUERY_BUILDER_CHAINABLE_METHODS)[number],
  jest.Mock
> & {
  getQuery: jest.Mock;
};

const createSubQueryBuilderMock = (): SubQueryBuilderMock => {
  const subQueryBuilderMock = {} as SubQueryBuilderMock;

  for (const method of SUB_QUERY_BUILDER_CHAINABLE_METHODS) {
    subQueryBuilderMock[method] = jest
      .fn()
      .mockReturnValue(subQueryBuilderMock);
  }

  subQueryBuilderMock.getQuery = jest.fn().mockReturnValue('SUBQUERY');

  return subQueryBuilderMock;
};

type QueryBuilderMock = Record<
  (typeof QUERY_BUILDER_CHAINABLE_METHODS)[number],
  jest.Mock
> & {
  subQuery: jest.Mock;
  getRawMany: jest.Mock;
  getCount: jest.Mock;
};

const createQueryBuilderMock = (
  getRawManyResult: () => unknown[],
  getCountResult: () => number,
  onSubQueryCreated?: (subQueryBuilderMock: SubQueryBuilderMock) => void,
): QueryBuilderMock => {
  const queryBuilderMock = {} as QueryBuilderMock;

  for (const method of QUERY_BUILDER_CHAINABLE_METHODS) {
    queryBuilderMock[method] = jest.fn().mockReturnValue(queryBuilderMock);
  }

  queryBuilderMock.subQuery = jest.fn().mockImplementation(() => {
    const subQueryBuilderMock = createSubQueryBuilderMock();

    onSubQueryCreated?.(subQueryBuilderMock);

    return subQueryBuilderMock;
  });
  queryBuilderMock.getRawMany = jest
    .fn()
    .mockImplementation(() => Promise.resolve(getRawManyResult()));
  queryBuilderMock.getCount = jest
    .fn()
    .mockImplementation(() => Promise.resolve(getCountResult()));

  return queryBuilderMock;
};

const getAndWhereConditions = (queryBuilderMock: QueryBuilderMock): string[] =>
  queryBuilderMock.andWhere.mock.calls
    .map(([condition]) => condition)
    .filter((condition): condition is string => typeof condition === 'string');

const RAW_ROW = {
  id: 'thread-1',
  title: 'Workspace setup',
  workspaceId: 'workspace-1',
  workspaceDisplayName: 'Acme',
  userWorkspaceId: 'user-workspace-1',
  userEmail: 'jane@acme.com',
  userFirstName: 'Jane',
  userLastName: 'Doe',
  messageCount: 4,
  userMessageCount: 2,
  hasError: false,
  isOnboardingThread: true,
  deletedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
};

const DEFAULT_ARGS = {
  scope: AdminChatThreadScope.ONBOARDING,
  hasErrorOnly: false,
  userNeverEngagedOnly: false,
  sortBy: AdminChatThreadSortField.CREATED_AT,
  sortDirection: AdminChatThreadSortDirection.DESC,
  limit: 25,
  offset: 0,
};

describe('AdminPanelChatService', () => {
  let service: AdminPanelChatService;
  let workspaceRepositoryFindOneMock: jest.Mock;
  let threadRepositoryFindMock: jest.Mock;
  let threadRepositoryFindOneMock: jest.Mock;
  let threadQueryBuilderMocks: QueryBuilderMock[];
  let subQueryBuilderMocks: SubQueryBuilderMock[];
  let threadRawManyResult: unknown[];
  let threadCountResult: number;
  let messageRepositoryFindMock: jest.Mock;
  let messageQueryBuilderMock: QueryBuilderMock;
  let messageRawManyResult: unknown[];

  beforeEach(async () => {
    workspaceRepositoryFindOneMock = jest.fn();
    threadRepositoryFindMock = jest.fn();
    threadRepositoryFindOneMock = jest.fn();
    threadQueryBuilderMocks = [];
    subQueryBuilderMocks = [];
    threadRawManyResult = [];
    threadCountResult = 0;
    messageRepositoryFindMock = jest.fn();
    messageRawManyResult = [];
    messageQueryBuilderMock = createQueryBuilderMock(
      () => messageRawManyResult,
      () => 0,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminPanelChatService,
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: { findOne: workspaceRepositoryFindOneMock },
        },
        {
          provide: getRepositoryToken(AgentChatThreadEntity),
          useValue: {
            find: threadRepositoryFindMock,
            findOne: threadRepositoryFindOneMock,
            createQueryBuilder: jest.fn(() => {
              const queryBuilderMock = createQueryBuilderMock(
                () => threadRawManyResult,
                () => threadCountResult,
                (subQueryBuilderMock) =>
                  subQueryBuilderMocks.push(subQueryBuilderMock),
              );

              threadQueryBuilderMocks.push(queryBuilderMock);

              return queryBuilderMock;
            }),
          },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(AgentMessageEntity),
          useValue: {
            find: messageRepositoryFindMock,
            createQueryBuilder: jest.fn(() => messageQueryBuilderMock),
          },
        },
      ],
    }).compile();

    service = module.get<AdminPanelChatService>(AdminPanelChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGlobalChatThreads', () => {
    it('should apply the onboarding fingerprint predicate only for the ONBOARDING scope', async () => {
      await service.getGlobalChatThreads(DEFAULT_ARGS);

      const [listQueryBuilder, countQueryBuilder] = threadQueryBuilderMocks;

      for (const queryBuilder of [listQueryBuilder, countQueryBuilder]) {
        const conditions = getAndWhereConditions(queryBuilder);

        expect(
          conditions.some(
            (condition) =>
              condition.includes('uuid_generate_v5') &&
              condition.includes('EXISTS (SUBQUERY)'),
          ),
        ).toBe(true);
        expect(queryBuilder.setParameter).toHaveBeenCalledWith(
          'setupThreadNamespace',
          WORKSPACE_SETUP_CHAT_THREAD_ID_NAMESPACE,
        );
      }

      const hiddenKickoffSubQueryBuilder = subQueryBuilderMocks[0];

      expect(hiddenKickoffSubQueryBuilder.from).toHaveBeenCalledWith(
        AgentMessageEntity,
        'hiddenMessage',
      );
      expect(hiddenKickoffSubQueryBuilder.andWhere).toHaveBeenCalledWith(
        'hiddenMessage.isHidden = true',
      );
    });

    it('should not apply the onboarding fingerprint predicate for the ALL scope', async () => {
      await service.getGlobalChatThreads({
        ...DEFAULT_ARGS,
        scope: AdminChatThreadScope.ALL,
      });

      for (const queryBuilder of threadQueryBuilderMocks) {
        expect(
          getAndWhereConditions(queryBuilder).some((condition) =>
            condition.includes('uuid_generate_v5'),
          ),
        ).toBe(false);
      }
    });

    it('should gate both queries on workspaces allowing impersonation', async () => {
      await service.getGlobalChatThreads(DEFAULT_ARGS);

      for (const queryBuilder of threadQueryBuilderMocks) {
        expect(queryBuilder.innerJoin).toHaveBeenCalledWith(
          'thread.workspace',
          'workspace',
          expect.stringContaining('"allowImpersonation" = true'),
        );
      }
    });

    it('should apply error and engagement filters when requested', async () => {
      await service.getGlobalChatThreads({
        ...DEFAULT_ARGS,
        hasErrorOnly: true,
        userNeverEngagedOnly: true,
      });

      const conditions = getAndWhereConditions(threadQueryBuilderMocks[0]);

      expect(
        conditions.some((condition) =>
          condition.includes('"lastStreamError" IS NOT NULL'),
        ),
      ).toBe(true);
      expect(
        conditions.some((condition) =>
          condition.includes('NOT EXISTS (SUBQUERY)'),
        ),
      ).toBe(true);
      expect(threadQueryBuilderMocks[0].setParameter).toHaveBeenCalledWith(
        'userMessageRole',
        AgentMessageRole.USER,
      );

      const visibleUserMessageSubQueryBuilder =
        subQueryBuilderMocks[subQueryBuilderMocks.length - 1];

      expect(visibleUserMessageSubQueryBuilder.from).toHaveBeenCalledWith(
        AgentMessageEntity,
        'userMessage',
      );
      expect(visibleUserMessageSubQueryBuilder.andWhere).toHaveBeenCalledWith(
        'userMessage.role = :userMessageRole',
      );
    });

    it('should apply the trimmed search term as an ILIKE pattern', async () => {
      await service.getGlobalChatThreads({
        ...DEFAULT_ARGS,
        searchTerm: '  jane@acme.com  ',
      });

      expect(threadQueryBuilderMocks[0].andWhere).toHaveBeenCalledWith(
        expect.any(Brackets),
        { searchPattern: '%jane@acme.com%' },
      );
    });

    it('should escape LIKE wildcards in the search term', async () => {
      await service.getGlobalChatThreads({
        ...DEFAULT_ARGS,
        searchTerm: 'my_workspace 100%',
      });

      expect(threadQueryBuilderMocks[0].andWhere).toHaveBeenCalledWith(
        expect.any(Brackets),
        { searchPattern: '%my\\_workspace 100\\%%' },
      );
    });

    it('should sort by message count with a stable id tiebreaker', async () => {
      await service.getGlobalChatThreads({
        ...DEFAULT_ARGS,
        sortBy: AdminChatThreadSortField.MESSAGE_COUNT,
        sortDirection: AdminChatThreadSortDirection.ASC,
      });

      const [listQueryBuilder] = threadQueryBuilderMocks;

      expect(listQueryBuilder.orderBy).toHaveBeenCalledWith(
        '"messageCount"',
        'ASC',
      );
      expect(listQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        '"thread"."id"',
        'ASC',
      );
    });

    it('should sort by thread columns for date sort fields', async () => {
      await service.getGlobalChatThreads(DEFAULT_ARGS);

      expect(threadQueryBuilderMocks[0].orderBy).toHaveBeenCalledWith(
        '"thread"."createdAt"',
        'DESC',
      );
    });

    it('should clamp the limit and floor the offset', async () => {
      await service.getGlobalChatThreads({
        ...DEFAULT_ARGS,
        limit: 500,
        offset: -10,
      });

      const [listQueryBuilder] = threadQueryBuilderMocks;

      expect(listQueryBuilder.limit).toHaveBeenCalledWith(100);
      expect(listQueryBuilder.offset).toHaveBeenCalledWith(0);
    });

    it('should compute hasMore from the offset, page size and total count', async () => {
      threadRawManyResult = Array.from({ length: 25 }, (_, index) => ({
        ...RAW_ROW,
        id: `thread-${index}`,
      }));
      threadCountResult = 60;

      const result = await service.getGlobalChatThreads({
        ...DEFAULT_ARGS,
        offset: 25,
      });

      expect(result.totalCount).toBe(60);
      expect(result.hasMore).toBe(true);

      const lastPageResult = await service.getGlobalChatThreads({
        ...DEFAULT_ARGS,
        offset: 35,
      });

      expect(lastPageResult.hasMore).toBe(false);
    });

    it('should map raw rows to DTOs tolerating missing user identity', async () => {
      threadRawManyResult = [
        {
          ...RAW_ROW,
          userEmail: null,
          userFirstName: null,
          userLastName: null,
          hasError: true,
        },
      ];
      threadCountResult = 1;

      const result = await service.getGlobalChatThreads(DEFAULT_ARGS);

      expect(result.threads).toEqual([
        expect.objectContaining({
          id: 'thread-1',
          userEmail: null,
          hasError: true,
          isOnboardingThread: true,
          messageCount: 4,
          userMessageCount: 2,
        }),
      ]);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('getWorkspaceChatThreads', () => {
    it('should merge message counts and default missing threads to zero', async () => {
      workspaceRepositoryFindOneMock.mockResolvedValue({
        id: 'workspace-1',
        allowImpersonation: true,
      });
      threadRepositoryFindMock.mockResolvedValue([
        { id: 'thread-1', title: 'A', conversationSize: 1000 },
        { id: 'thread-2', title: 'B', conversationSize: 2000 },
      ]);
      messageRawManyResult = [{ threadId: 'thread-1', messageCount: 7 }];

      const result = await service.getWorkspaceChatThreads('workspace-1');

      expect(result[0].messageCount).toBe(7);
      expect(result[1].messageCount).toBe(0);
    });

    it('should throw when the workspace has not enabled support access', async () => {
      workspaceRepositoryFindOneMock.mockResolvedValue({
        id: 'workspace-1',
        allowImpersonation: false,
      });

      await expect(
        service.getWorkspaceChatThreads('workspace-1'),
      ).rejects.toThrow(UserInputError);
    });
  });

  describe('getChatThreadMessages', () => {
    it('should return the hidden kickoff message with enriched parts', async () => {
      threadRepositoryFindOneMock.mockResolvedValue({
        id: 'thread-1',
        workspaceId: 'workspace-1',
        title: 'Workspace setup',
        totalInputTokens: 10,
        totalOutputTokens: 20,
        conversationSize: 1000,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-02'),
      });
      workspaceRepositoryFindOneMock.mockResolvedValue({
        id: 'workspace-1',
        allowImpersonation: true,
      });
      messageRepositoryFindMock.mockResolvedValue([
        {
          id: 'message-1',
          role: AgentMessageRole.USER,
          isHidden: true,
          createdAt: new Date('2026-01-01'),
          parts: [
            {
              type: 'text',
              orderIndex: 0,
              textContent: 'kickoff prompt',
              reasoningContent: null,
              toolName: null,
              toolCallId: null,
              toolInput: null,
              toolOutput: null,
              state: null,
              errorMessage: null,
            },
          ],
        },
        {
          id: 'message-2',
          role: AgentMessageRole.ASSISTANT,
          isHidden: false,
          createdAt: new Date('2026-01-01T01:00:00Z'),
          parts: [
            {
              type: 'tool-call',
              orderIndex: 1,
              textContent: null,
              reasoningContent: null,
              toolName: 'create_many_object_metadata',
              toolCallId: 'call-1',
              toolInput: { objects: [] },
              toolOutput: { success: true },
              state: 'output-available',
              errorMessage: null,
            },
            {
              type: 'reasoning',
              orderIndex: 0,
              textContent: null,
              reasoningContent: 'thinking',
              toolName: null,
              toolCallId: null,
              toolInput: null,
              toolOutput: null,
              state: null,
              errorMessage: null,
            },
          ],
        },
      ]);

      const result = await service.getChatThreadMessages('thread-1');

      expect(messageRepositoryFindMock).toHaveBeenCalledWith(
        'workspace-1',
        expect.objectContaining({ where: { threadId: 'thread-1' } }),
      );
      expect(result.thread.messageCount).toBe(1);
      expect(result.messages[0].isHidden).toBe(true);
      expect(result.messages[1].parts.map((part) => part.orderIndex)).toEqual([
        0, 1,
      ]);
      expect(result.messages[1].parts[1]).toEqual(
        expect.objectContaining({
          toolName: 'create_many_object_metadata',
          toolInput: { objects: [] },
          toolOutput: { success: true },
          state: 'output-available',
        }),
      );
    });

    it('should throw when the thread workspace has not enabled support access', async () => {
      threadRepositoryFindOneMock.mockResolvedValue({
        id: 'thread-1',
        workspaceId: 'workspace-1',
      });
      workspaceRepositoryFindOneMock.mockResolvedValue({
        id: 'workspace-1',
        allowImpersonation: false,
      });

      await expect(service.getChatThreadMessages('thread-1')).rejects.toThrow(
        UserInputError,
      );
    });
  });
});
