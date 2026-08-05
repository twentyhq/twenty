import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Brackets } from 'typeorm';
import { AdminChatThreadScope } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-scope.enum';
import { AdminChatThreadSortDirection } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-sort-direction.enum';
import { AdminChatThreadSortField } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-sort-field.enum';
import { AdminPanelGlobalChatThreadsService } from 'src/engine/core-modules/admin-panel/services/admin-panel-global-chat-threads.service';
import {
  AgentMessageEntity,
  AgentMessageRole,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { WORKSPACE_SETUP_CHAT_THREAD_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-chat-thread-id-namespace.constant';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';

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

describe('AdminPanelGlobalChatThreadsService', () => {
  let service: AdminPanelGlobalChatThreadsService;
  let threadQueryBuilderMocks: QueryBuilderMock[];
  let subQueryBuilderMocks: SubQueryBuilderMock[];
  let threadRawManyResult: unknown[];
  let threadCountResult: number;

  beforeEach(async () => {
    threadQueryBuilderMocks = [];
    subQueryBuilderMocks = [];
    threadRawManyResult = [];
    threadCountResult = 0;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminPanelGlobalChatThreadsService,
        {
          provide: getRepositoryToken(AgentChatThreadEntity),
          useValue: {
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
      ],
    }).compile();

    service = module.get<AdminPanelGlobalChatThreadsService>(
      AdminPanelGlobalChatThreadsService,
    );
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

    it('should gate both queries on live workspaces allowing impersonation', async () => {
      await service.getGlobalChatThreads(DEFAULT_ARGS);

      for (const queryBuilder of threadQueryBuilderMocks) {
        expect(queryBuilder.innerJoin).toHaveBeenCalledWith(
          'thread.workspace',
          'workspace',
          '"workspace"."allowImpersonation" = true AND "workspace"."deletedAt" IS NULL',
        );
      }
    });

    it('should keep soft-deleted user identity while joining thread owners', async () => {
      await service.getGlobalChatThreads(DEFAULT_ARGS);

      for (const queryBuilder of threadQueryBuilderMocks) {
        expect(queryBuilder.leftJoin).toHaveBeenCalledWith(
          'thread.userWorkspace',
          'userWorkspace',
        );
        expect(queryBuilder.leftJoin).toHaveBeenCalledWith(
          'userWorkspace.user',
          'user',
        );
        expect(queryBuilder.withDeleted).toHaveBeenCalled();
      }
    });

    it('should count only visible messages', async () => {
      await service.getGlobalChatThreads(DEFAULT_ARGS);

      const [listQueryBuilder] = threadQueryBuilderMocks;

      expect(listQueryBuilder.leftJoin).toHaveBeenCalledWith(
        'thread.messages',
        'message',
        '"message"."isHidden" = false',
      );
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
});
