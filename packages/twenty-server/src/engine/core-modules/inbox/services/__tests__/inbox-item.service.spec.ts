import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { In, IsNull, LessThanOrEqual, MoreThan, Or } from 'typeorm';

import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { InboxItemScope } from 'src/engine/core-modules/inbox/enums/inbox-item-scope.enum';
import { InboxItemStatus } from 'src/engine/core-modules/inbox/enums/inbox-item-status.enum';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
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
    status: InboxItemStatus.OPEN,
    priority: InboxItemPriority.UPDATE,
    title: 'A message from Alice',
    readAt: null,
    snoozedUntil: null,
    resolvedAt: null,
    resolvedByUserWorkspaceId: null,
    ...overrides,
  }) as InboxItemEntity;

const ownedItemArgs = {
  inboxItemId: INBOX_ITEM_ID,
  workspaceId: WORKSPACE_ID,
  assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findMany', () => {
    it('should exclude items snoozed into the future when the scope is INBOX', async () => {
      // Act
      await service.findMany({
        workspaceId: WORKSPACE_ID,
        assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        scope: InboxItemScope.INBOX,
      });

      // Assert
      // The workspace scope is the repository's first argument; the assignee
      // scope stays an explicit predicate this service owns
      expect(inboxItemRepository.find).toHaveBeenCalledWith(WORKSPACE_ID, {
        where: {
          assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
          status: InboxItemStatus.OPEN,
          snoozedUntil: Or(IsNull(), LessThanOrEqual(NOW)),
        },
        relations: { inboxItemType: true },
        order: { updatedAt: 'DESC' },
        take: DEFAULT_INBOX_PAGE_SIZE,
      });
    });

    it('should return only open items snoozed into the future when the scope is SNOOZED', async () => {
      // Act
      await service.findMany({
        workspaceId: WORKSPACE_ID,
        assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        scope: InboxItemScope.SNOOZED,
      });

      // Assert
      const [, findOptions] = inboxItemRepository.find.mock.calls[0];

      expect(findOptions.where).toEqual({
        assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        status: InboxItemStatus.OPEN,
        snoozedUntil: MoreThan(NOW),
      });
    });

    it('should return done and dismissed items regardless of snoozing when the scope is RESOLVED', async () => {
      // Act
      await service.findMany({
        workspaceId: WORKSPACE_ID,
        assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        scope: InboxItemScope.RESOLVED,
      });

      // Assert
      const [, findOptions] = inboxItemRepository.find.mock.calls[0];

      expect(findOptions.where).toEqual({
        assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        status: In([InboxItemStatus.DONE, InboxItemStatus.DISMISSED]),
      });
      expect('snoozedUntil' in findOptions.where).toBe(false);
    });

    it('should cap the page size to the given limit when a limit is provided', async () => {
      // Act
      await service.findMany({
        workspaceId: WORKSPACE_ID,
        assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        scope: InboxItemScope.INBOX,
        limit: 5,
      });

      // Assert
      expect(inboxItemRepository.find).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ take: 5 }),
      );
    });
  });

  describe('findOwnedItemOrThrow', () => {
    it('should scope the lookup to the caller when the item is owned', async () => {
      // Prepare
      const inboxItem = buildInboxItem();

      inboxItemRepository.findOne.mockResolvedValue(inboxItem);

      // Act
      const result = await service.findOwnedItemOrThrow(ownedItemArgs);

      // Assert
      expect(result).toEqual(inboxItem);
      expect(inboxItemRepository.findOne).toHaveBeenCalledWith(WORKSPACE_ID, {
        where: {
          id: INBOX_ITEM_ID,
          assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        },
        relations: { inboxItemType: true },
      });
    });

    it('should throw a NotFoundException when the item belongs to another assignee', async () => {
      // Prepare
      // The assignee scoped lookup simply does not match another user's row
      inboxItemRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findOwnedItemOrThrow({
          ...ownedItemArgs,
          assigneeUserWorkspaceId: 'another-user-workspace-id',
        }),
      ).rejects.toThrow(NotFoundException);
      expect(inboxItemRepository.findOne).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({
          where: expect.objectContaining({
            assigneeUserWorkspaceId: 'another-user-workspace-id',
          }),
        }),
      );
    });
  });

  describe('mutations ownership', () => {
    it.each([
      ['complete', () => service.complete(ownedItemArgs)],
      ['reopen', () => service.reopen(ownedItemArgs)],
      ['dismiss', () => service.dismiss(ownedItemArgs)],
      ['markRead', () => service.markRead(ownedItemArgs)],
      ['snooze', () => service.snooze({ ...ownedItemArgs, snoozedUntil: NOW })],
    ])(
      'should throw a NotFoundException and mutate nothing from %s when the item is not owned by the caller',
      async (_mutationName, mutate) => {
        // Prepare
        inboxItemRepository.findOne.mockResolvedValue(null);

        // Act & Assert
        await expect(mutate()).rejects.toThrow(NotFoundException);
        expect(inboxItemRepository.update).not.toHaveBeenCalled();
      },
    );
  });

  describe('complete', () => {
    it('should mark the item done, stamp the resolver and clear the snooze when the item is owned', async () => {
      // Act
      await service.complete(ownedItemArgs);

      // Assert
      expect(inboxItemRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        {
          id: INBOX_ITEM_ID,
          assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        },
        {
          status: InboxItemStatus.DONE,
          resolvedAt: NOW,
          resolvedByUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
          readAt: NOW,
          snoozedUntil: null,
        },
      );
    });

    it('should return the item as it stands after the update', async () => {
      // Prepare
      const completedItem = buildInboxItem({
        status: InboxItemStatus.DONE,
        resolvedAt: NOW,
      });

      inboxItemRepository.findOne
        .mockResolvedValueOnce(buildInboxItem())
        .mockResolvedValueOnce(completedItem);

      // Act
      const result = await service.complete(ownedItemArgs);

      // Assert
      expect(result).toEqual(completedItem);
    });
  });

  describe('snooze', () => {
    it('should store the snooze deadline and mark the item read when the item is owned', async () => {
      // Prepare
      const snoozedUntil = new Date('2026-08-07T11:00:00.000Z');

      // Act
      await service.snooze({ ...ownedItemArgs, snoozedUntil });

      // Assert
      expect(inboxItemRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        {
          id: INBOX_ITEM_ID,
          assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        },
        { snoozedUntil, readAt: NOW },
      );
    });
  });

  describe('markRead', () => {
    it('should only stamp readAt when the item is owned', async () => {
      // Act
      await service.markRead(ownedItemArgs);

      // Assert
      expect(inboxItemRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        {
          id: INBOX_ITEM_ID,
          assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        },
        { readAt: NOW },
      );
    });
  });

  describe('reopen', () => {
    it('should clear the resolution and the snooze when the item is owned', async () => {
      // Act
      await service.reopen(ownedItemArgs);

      // Assert
      expect(inboxItemRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        {
          id: INBOX_ITEM_ID,
          assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        },
        {
          status: InboxItemStatus.OPEN,
          resolvedAt: null,
          resolvedByUserWorkspaceId: null,
          snoozedUntil: null,
          readAt: null,
        },
      );
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
        assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
      });

      // Assert
      expect(result).toEqual({ unread: 4, needsAction: 2, snoozed: 1 });
    });

    it('should count unread and needs action within the visible inbox and snoozed within the snoozed scope', async () => {
      // Act
      await service.countByScope({
        workspaceId: WORKSPACE_ID,
        assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
      });

      // Assert
      const visibleCriteria = {
        assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
        status: InboxItemStatus.OPEN,
        snoozedUntil: Or(IsNull(), LessThanOrEqual(NOW)),
      };

      expect(inboxItemRepository.count).toHaveBeenCalledTimes(3);
      expect(inboxItemRepository.count).toHaveBeenNthCalledWith(
        1,
        WORKSPACE_ID,
        { where: { ...visibleCriteria, readAt: IsNull() } },
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
            status: InboxItemStatus.OPEN,
            snoozedUntil: MoreThan(NOW),
          },
        },
      );
    });
  });
});
