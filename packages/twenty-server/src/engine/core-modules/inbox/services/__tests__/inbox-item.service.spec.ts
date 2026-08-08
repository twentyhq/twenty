import { Test, type TestingModule } from '@nestjs/testing';

import { In } from 'typeorm';

import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { InboxItemScope } from 'src/engine/core-modules/inbox/enums/inbox-item-scope.enum';
import { InboxExceptionCode } from 'src/engine/core-modules/inbox/inbox.exception';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import {
  buildInboxItemScopeCriteria,
  buildInboxItemUnreadCriteria,
} from 'src/engine/core-modules/inbox/utils/inbox-item-scope.util';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = 'workspace-id';
const ASSIGNEE_USER_WORKSPACE_ID = 'assignee-user-workspace-id';
const INBOX_ITEM_ID = 'inbox-item-id';
const NOW = new Date('2026-08-07T10:00:00.000Z');
const DEFAULT_INBOX_PAGE_SIZE = 50;

const buildInboxItem = (
  overrides: Partial<InboxItemEntity> = {},
): InboxItemEntity =>
  ({
    id: INBOX_ITEM_ID,
    workspaceId: WORKSPACE_ID,
    assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
    priority: InboxItemPriority.UPDATE,
    title: 'A message from Alice',
    lastEventAt: NOW,
    clearedAt: null,
    resurfaceAt: null,
    readAt: null,
    ...overrides,
  }) as InboxItemEntity;

const ownedItemArgs = {
  inboxItemId: INBOX_ITEM_ID,
  workspaceId: WORKSPACE_ID,
  actorUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
  memberQueueIds: [],
};

describe('InboxItemService', () => {
  let service: InboxItemService;

  const inboxItemRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(NOW);

    inboxItemRepository.find.mockResolvedValue([]);
    inboxItemRepository.findOne.mockResolvedValue(buildInboxItem());
    inboxItemRepository.count.mockResolvedValue(0);
    inboxItemRepository.update.mockResolvedValue({ affected: 1 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxItemService,
        {
          provide: getWorkspaceScopedRepositoryToken(InboxItemEntity),
          useValue: inboxItemRepository,
        },
      ],
    }).compile();

    service = module.get<InboxItemService>(InboxItemService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('findMany', () => {
    it.each([
      InboxItemScope.INBOX,
      InboxItemScope.SNOOZED,
      InboxItemScope.DONE,
    ])('should filter by the one scope predicate for %s', async (scope) => {
      // Act
      await service.findMany({
        workspaceId: WORKSPACE_ID,
        actorUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        readScope: { kind: 'personal' },
        scope,
        now: NOW,
      });

      // Assert
      // The workspace scope is the repository's first argument; the assignee
      // scope stays an explicit predicate this service owns
      const [, findOptions] = inboxItemRepository.find.mock.calls[0];

      expect(findOptions.where).toEqual({
        assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        ...buildInboxItemScopeCriteria(scope, NOW),
      });
    });

    it('should order by when the subject last did something, not by when the row changed', async () => {
      // Act
      await service.findMany({
        workspaceId: WORKSPACE_ID,
        actorUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        readScope: { kind: 'personal' },
        scope: InboxItemScope.INBOX,
        now: NOW,
      });

      // Assert
      expect(inboxItemRepository.find).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({
          order: { lastEventAt: 'DESC' },
          relations: { inboxItemType: true, assigneeUserWorkspace: true },
          take: DEFAULT_INBOX_PAGE_SIZE,
        }),
      );
    });

    it('should cap the page size to the given limit when a limit is provided', async () => {
      // Act
      await service.findMany({
        workspaceId: WORKSPACE_ID,
        actorUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        readScope: { kind: 'personal' },
        scope: InboxItemScope.INBOX,
        now: NOW,
        limit: 5,
      });

      // Assert
      expect(inboxItemRepository.find).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ take: 5 }),
      );
    });
  });

  describe('findVisibleItemOrThrow', () => {
    it('should scope the lookup to the caller when the item is owned', async () => {
      // Prepare
      const inboxItem = buildInboxItem();

      inboxItemRepository.findOne.mockResolvedValue(inboxItem);

      // Act
      const result = await service.findVisibleItemOrThrow(ownedItemArgs);

      // Assert
      expect(result).toEqual(inboxItem);
      expect(inboxItemRepository.findOne).toHaveBeenCalledWith(WORKSPACE_ID, {
        where: [
          {
            id: INBOX_ITEM_ID,
            assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
          },
        ],
        relations: { inboxItemType: true, assigneeUserWorkspace: true },
      });
    });

    it('should refuse to read the item when the item belongs to another assignee', async () => {
      // Prepare
      // The assignee scoped lookup simply does not match another user's row
      inboxItemRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findVisibleItemOrThrow({
          ...ownedItemArgs,
          actorUserWorkspaceId: 'another-user-workspace-id',
        }),
      ).rejects.toMatchObject({
        code: InboxExceptionCode.INBOX_ITEM_NOT_FOUND,
      });
      expect(inboxItemRepository.findOne).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({
          where: [
            expect.objectContaining({
              assigneeUserWorkspaceId: 'another-user-workspace-id',
            }),
          ],
        }),
      );
    });
  });

  describe('queue visibility', () => {
    // Membership is the only thing keeping one team out of another's inbox
    it('should reach an item through a queue the caller belongs to', async () => {
      // Act
      await service.findVisibleItem({
        ...ownedItemArgs,
        memberQueueIds: ['support-queue-id'],
      });

      // Assert
      const [, findOptions] = inboxItemRepository.findOne.mock.calls[0];

      expect(findOptions.where).toEqual([
        {
          id: INBOX_ITEM_ID,
          assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        },
        { id: INBOX_ITEM_ID, queueId: In(['support-queue-id']) },
      ]);
    });

    it('should offer no queue path at all when the caller belongs to none', async () => {
      // Act
      await service.findVisibleItem(ownedItemArgs);

      // Assert
      const [, findOptions] = inboxItemRepository.findOne.mock.calls[0];

      expect(findOptions.where).toHaveLength(1);
    });

    it('should read a shared inbox by the queue rather than by who holds each item', async () => {
      // Act
      await service.findMany({
        workspaceId: WORKSPACE_ID,
        actorUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        readScope: { kind: 'queue', queueId: 'support-queue-id' },
        scope: InboxItemScope.INBOX,
        now: NOW,
      });

      // Assert
      const [, findOptions] = inboxItemRepository.find.mock.calls[0];

      expect(findOptions.where).toEqual({
        queueId: 'support-queue-id',
        ...buildInboxItemScopeCriteria(InboxItemScope.INBOX, NOW),
      });
    });

    // A write is scoped by whatever made the item readable, so a queue item
    // stays writable after someone else takes it
    it('should scope a write to the queue when the item belongs to one', () => {
      // Act
      const writeScope = service.buildWriteScope({
        inboxItem: { id: INBOX_ITEM_ID, queueId: 'support-queue-id' } as never,
        actorUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        memberQueueIds: ['support-queue-id'],
      });

      // Assert
      expect(writeScope).toEqual({
        id: INBOX_ITEM_ID,
        queueId: In(['support-queue-id']),
      });
    });
  });

  describe('markRead', () => {
    it('should refuse and mutate nothing when the item is not owned by the caller', async () => {
      // Prepare
      inboxItemRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.markRead(ownedItemArgs)).rejects.toMatchObject({
        code: InboxExceptionCode.INBOX_ITEM_NOT_FOUND,
      });
      expect(inboxItemRepository.update).not.toHaveBeenCalled();
    });

    it('should only stamp readAt, leaving the event that ordered the list alone', async () => {
      // Act
      await service.markRead(ownedItemArgs);

      // Assert
      const [, predicate, partialUpdate] =
        inboxItemRepository.update.mock.calls[0];

      expect(predicate).toEqual({
        id: INBOX_ITEM_ID,
        assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
      });
      expect(Object.keys(partialUpdate)).toEqual(['readAt']);
      // Stamped by the database, since unread compares it against lastEventAt
      expect(partialUpdate.readAt()).toBe('clock_timestamp()');
    });
  });

  describe('countByScope', () => {
    it('should return the unread, needs action and snoozed counts', async () => {
      // Prepare
      inboxItemRepository.count
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1);

      // Act
      const result = await service.countByScope({
        workspaceId: WORKSPACE_ID,
        actorUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        readScope: { kind: 'personal' },
        now: NOW,
      });

      // Assert
      expect(result).toEqual({ unread: 4, needsAction: 2, snoozed: 1 });
    });

    it('should count unread and needs action within the visible inbox and snoozed within the snoozed scope', async () => {
      // Act
      await service.countByScope({
        workspaceId: WORKSPACE_ID,
        actorUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        readScope: { kind: 'personal' },
        now: NOW,
      });

      // Assert
      const visibleCriteria = {
        assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        ...buildInboxItemScopeCriteria(InboxItemScope.INBOX, NOW),
      };

      expect(inboxItemRepository.count).toHaveBeenCalledTimes(3);
      expect(inboxItemRepository.count).toHaveBeenNthCalledWith(
        1,
        WORKSPACE_ID,
        { where: { ...visibleCriteria, ...buildInboxItemUnreadCriteria() } },
      );
      expect(inboxItemRepository.count).toHaveBeenNthCalledWith(
        2,
        WORKSPACE_ID,
        {
          where: {
            ...visibleCriteria,
            priority: InboxItemPriority.NEEDS_ACTION,
          },
        },
      );
      expect(inboxItemRepository.count).toHaveBeenNthCalledWith(
        3,
        WORKSPACE_ID,
        {
          where: {
            assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
            ...buildInboxItemScopeCriteria(InboxItemScope.SNOOZED, NOW),
          },
        },
      );
    });
  });
});
