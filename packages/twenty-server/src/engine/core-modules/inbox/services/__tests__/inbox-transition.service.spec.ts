import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { type InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import { InboxTransitionService } from 'src/engine/core-modules/inbox/services/inbox-transition.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = 'workspace-id';
const ACTOR_USER_WORKSPACE_ID = 'actor-user-workspace-id';
const INBOX_ITEM_ID = 'inbox-item-id';
const NOW = new Date('2026-08-07T10:00:00.000Z');

const APPROVAL_TYPE = {
  id: 'approval-type-id',
  key: 'approval',
  resolution: {
    outcomes: [
      { key: 'APPROVED', label: 'Approved' },
      { key: 'REJECTED', label: 'Rejected' },
    ],
  },
} as InboxItemTypeEntity;

const buildInboxItem = (
  overrides: Partial<InboxItemEntity> = {},
): InboxItemEntity =>
  ({
    id: INBOX_ITEM_ID,
    workspaceId: WORKSPACE_ID,
    assigneeUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
    inboxItemType: APPROVAL_TYPE,
    lastEventAt: new Date('2026-08-07T09:00:00.000Z'),
    clearedAt: null,
    version: 3,
    ...overrides,
  }) as InboxItemEntity;

const transitionArgs = {
  inboxItemId: INBOX_ITEM_ID,
  workspaceId: WORKSPACE_ID,
  actorUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
};

describe('InboxTransitionService', () => {
  let service: InboxTransitionService;

  const inboxItemRepository = { update: jest.fn() };
  const inboxItemService = { findOwnedItemOrThrow: jest.fn() };

  const lastPartialUpdate = () =>
    inboxItemRepository.update.mock.calls[0][2] as Record<string, unknown>;

  const lastPredicate = () =>
    inboxItemRepository.update.mock.calls[0][1] as Record<string, unknown>;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(NOW);

    inboxItemRepository.update.mockResolvedValue({ affected: 1 });
    inboxItemService.findOwnedItemOrThrow.mockResolvedValue(buildInboxItem());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxTransitionService,
        {
          provide: getWorkspaceScopedRepositoryToken(InboxItemEntity),
          useValue: inboxItemRepository,
        },
        { provide: InboxItemService, useValue: inboxItemService },
      ],
    }).compile();

    service = module.get<InboxTransitionService>(InboxTransitionService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('optimistic concurrency', () => {
    it('should put the expected version in the write predicate so a stale caller loses', async () => {
      // Act
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'CLEAR', outcome: 'APPROVED' },
        expectedVersion: 3,
      });

      // Assert
      expect(lastPredicate()).toEqual(expect.objectContaining({ version: 3 }));
    });

    it('should bump the version on every transition', async () => {
      // Act
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'CLEAR' },
      });

      // Assert
      const version = lastPartialUpdate().version as () => string;

      expect(version()).toBe('"version" + 1');
    });

    it('should reject when the item moved since it was read', async () => {
      // Prepare
      inboxItemRepository.update.mockResolvedValue({ affected: 0 });

      // Act & Assert
      await expect(
        service.transition({
          ...transitionArgs,
          transition: { kind: 'CLEAR', outcome: 'APPROVED' },
          expectedVersion: 2,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should apply without a version guard when the caller does not supply one', async () => {
      // Act
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'CLEAR' },
      });

      // Assert
      expect(lastPredicate()).not.toHaveProperty('version');
    });
  });

  describe('CLEAR', () => {
    it('should stamp who cleared it and count as having seen it', async () => {
      // Act
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'CLEAR' },
      });

      // Assert
      expect(lastPartialUpdate()).toEqual(
        expect.objectContaining({
          clearedByUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
          resurfaceAt: null,
        }),
      );
    });

    // Both sides of the comparison have to come from one clock, and the events
    // are stamped by Postgres, so the clear has to be too
    it('should let the database stamp the columns compared against the event', async () => {
      // Act
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'CLEAR' },
      });

      // Assert
      const partialUpdate = lastPartialUpdate() as Record<string, () => string>;

      expect(partialUpdate.clearedAt()).toBe('clock_timestamp()');
      expect(partialUpdate.readAt()).toBe('clock_timestamp()');
    });

    it('should never write lastEventAt, which only producers own', async () => {
      // Act
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'CLEAR' },
      });

      // Assert
      expect(lastPartialUpdate()).not.toHaveProperty('lastEventAt');
    });

    it('should record the outcome and its result', async () => {
      // Act
      await service.transition({
        ...transitionArgs,
        transition: {
          kind: 'CLEAR',
          outcome: 'REJECTED',
          result: { reason: 'Not this quarter' },
        },
      });

      // Assert
      expect(lastPartialUpdate()).toEqual(
        expect.objectContaining({
          outcome: 'REJECTED',
          result: { reason: 'Not this quarter' },
        }),
      );
    });

    it('should refuse an outcome the type does not declare', async () => {
      // Act & Assert
      await expect(
        service.transition({
          ...transitionArgs,
          transition: { kind: 'CLEAR', outcome: 'SHIPPED' },
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept any outcome when the type declares none', async () => {
      // Prepare
      inboxItemService.findOwnedItemOrThrow.mockResolvedValue(
        buildInboxItem({
          inboxItemType: {
            id: 'type-id',
            key: 'conversation',
          } as InboxItemTypeEntity,
        }),
      );

      // Act
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'CLEAR', outcome: 'ANYTHING' },
      });

      // Assert
      expect(lastPartialUpdate()).toEqual(
        expect.objectContaining({ outcome: 'ANYTHING' }),
      );
    });

    it('should apply to an item that was already cleared, since clearing is not a state change', async () => {
      // Prepare
      inboxItemService.findOwnedItemOrThrow.mockResolvedValue(
        buildInboxItem({ clearedAt: new Date('2026-08-07T09:30:00.000Z') }),
      );

      // Act
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'CLEAR', outcome: 'APPROVED' },
      });

      // Assert
      const partialUpdate = lastPartialUpdate() as Record<string, () => string>;

      expect(partialUpdate.clearedAt()).toBe('clock_timestamp()');
    });
  });

  describe('CLEAR with a resurfacing time', () => {
    it('should be a clear that expires rather than a state of its own', async () => {
      // Act
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'CLEAR', resurfaceInMinutes: 60 },
      });

      // Assert
      // The resurfacing time is the one timestamp on this side that is not the
      // database's, because it is only ever compared against a reading
      // request's own clock
      expect(lastPartialUpdate()).toEqual(
        expect.objectContaining({
          resurfaceAt: new Date('2026-08-07T11:00:00.000Z'),
        }),
      );
    });

    it('should refuse a non positive delay', async () => {
      // Act & Assert
      await expect(
        service.transition({
          ...transitionArgs,
          transition: { kind: 'CLEAR', resurfaceInMinutes: 0 },
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should refuse a delay longer than a year', async () => {
      // Act & Assert
      await expect(
        service.transition({
          ...transitionArgs,
          transition: { kind: 'CLEAR', resurfaceInMinutes: 60 * 24 * 400 },
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('REOPEN', () => {
    it('should undo the clear and how it ended', async () => {
      // Prepare
      inboxItemService.findOwnedItemOrThrow.mockResolvedValue(
        buildInboxItem({ clearedAt: new Date('2026-08-07T09:30:00.000Z') }),
      );

      // Act
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'REOPEN' },
      });

      // Assert
      expect(lastPartialUpdate()).toEqual(
        expect.objectContaining({
          clearedAt: null,
          clearedByUserWorkspaceId: null,
          resurfaceAt: null,
          outcome: null,
          result: null,
        }),
      );
    });

    it('should leave readAt alone, since moving something back is not a reason to unread it', async () => {
      // Prepare
      inboxItemService.findOwnedItemOrThrow.mockResolvedValue(
        buildInboxItem({ clearedAt: new Date('2026-08-07T09:30:00.000Z') }),
      );

      // Act
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'REOPEN' },
      });

      // Assert
      expect(lastPartialUpdate()).not.toHaveProperty('readAt');
    });
  });

  describe('ownership', () => {
    it('should scope the write to the actor, not only the preceding read', async () => {
      // Act
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'CLEAR' },
      });

      // Assert
      expect(lastPredicate()).toEqual(
        expect.objectContaining({
          assigneeUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
        }),
      );
    });
  });
});
