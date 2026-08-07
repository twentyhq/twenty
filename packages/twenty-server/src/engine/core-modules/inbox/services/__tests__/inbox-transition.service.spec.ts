import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemStatus } from 'src/engine/core-modules/inbox/enums/inbox-item-status.enum';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import { InboxTransitionService } from 'src/engine/core-modules/inbox/services/inbox-transition.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = 'workspace-id';
const ACTOR_USER_WORKSPACE_ID = 'actor-user-workspace-id';
const OTHER_USER_WORKSPACE_ID = 'other-user-workspace-id';
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
    status: InboxItemStatus.OPEN,
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
  const userWorkspaceRepository = { findOne: jest.fn() };

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
    userWorkspaceRepository.findOne.mockResolvedValue({
      id: OTHER_USER_WORKSPACE_ID,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxTransitionService,
        {
          provide: getWorkspaceScopedRepositoryToken(InboxItemEntity),
          useValue: inboxItemRepository,
        },
        { provide: InboxItemService, useValue: inboxItemService },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: userWorkspaceRepository,
        },
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
        transition: { kind: 'RESOLVE', outcome: 'APPROVED' },
        expectedVersion: 3,
      });

      // Assert
      expect(lastPredicate()).toEqual(expect.objectContaining({ version: 3 }));
    });

    it('should bump the version on every transition', async () => {
      // Act
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'RELEASE' },
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
          transition: { kind: 'RESOLVE', outcome: 'APPROVED' },
          expectedVersion: 2,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should apply without a version guard when the caller does not supply one', async () => {
      // Act
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'RELEASE' },
      });

      // Assert
      expect(lastPredicate()).not.toHaveProperty('version');
    });
  });

  describe('RESOLVE', () => {
    it('should record the outcome and its result', async () => {
      // Act
      await service.transition({
        ...transitionArgs,
        transition: {
          kind: 'RESOLVE',
          outcome: 'REJECTED',
          result: { reason: 'Not this quarter' },
        },
      });

      // Assert
      expect(lastPartialUpdate()).toEqual(
        expect.objectContaining({
          status: InboxItemStatus.RESOLVED,
          outcome: 'REJECTED',
          result: { reason: 'Not this quarter' },
          resolvedByUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
        }),
      );
    });

    it('should refuse an outcome the type does not declare', async () => {
      // Act & Assert
      await expect(
        service.transition({
          ...transitionArgs,
          transition: { kind: 'RESOLVE', outcome: 'SHIPPED' },
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
        transition: { kind: 'RESOLVE', outcome: 'ANYTHING' },
      });

      // Assert
      expect(lastPartialUpdate()).toEqual(
        expect.objectContaining({ outcome: 'ANYTHING' }),
      );
    });

    it('should refuse to resolve an item that already ended', async () => {
      // Prepare
      inboxItemService.findOwnedItemOrThrow.mockResolvedValue(
        buildInboxItem({ status: InboxItemStatus.RESOLVED }),
      );

      // Act & Assert
      await expect(
        service.transition({
          ...transitionArgs,
          transition: { kind: 'RESOLVE', outcome: 'APPROVED' },
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('CANCEL', () => {
    it('should keep the reason and clear the snooze', async () => {
      // Act
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'CANCEL', reason: 'No longer relevant' },
      });

      // Assert
      expect(lastPartialUpdate()).toEqual(
        expect.objectContaining({
          status: InboxItemStatus.CANCELLED,
          cancellationReason: 'No longer relevant',
          snoozedUntil: null,
        }),
      );
    });
  });

  describe('CLAIM and RELEASE', () => {
    it('should lease the item to the actor for the requested duration', async () => {
      // Act
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'CLAIM', leaseDurationMinutes: 15 },
      });

      // Assert
      expect(lastPartialUpdate()).toEqual(
        expect.objectContaining({
          claimedByUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
          claimExpiresAt: new Date('2026-08-07T10:15:00.000Z'),
        }),
      );
    });

    it('should give the item back on release', async () => {
      // Act
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'RELEASE' },
      });

      // Assert
      expect(lastPartialUpdate()).toEqual(
        expect.objectContaining({
          claimedByUserWorkspaceId: null,
          claimExpiresAt: null,
        }),
      );
    });

    it('should refuse a lease longer than a year', async () => {
      // Act & Assert
      await expect(
        service.transition({
          ...transitionArgs,
          transition: { kind: 'CLAIM', leaseDurationMinutes: 60 * 24 * 400 },
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('REASSIGN', () => {
    it('should refuse a target that is not in the workspace', async () => {
      // Prepare
      userWorkspaceRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.transition({
          ...transitionArgs,
          transition: {
            kind: 'REASSIGN',
            targetUserWorkspaceId: 'someone-elses-workspace',
          },
        }),
      ).rejects.toThrow(BadRequestException);
      expect(inboxItemRepository.update).not.toHaveBeenCalled();
    });

    it('should read the item back as the new target rather than the actor', async () => {
      // Act
      await service.transition({
        ...transitionArgs,
        transition: {
          kind: 'REASSIGN',
          targetUserWorkspaceId: OTHER_USER_WORKSPACE_ID,
        },
      });

      // Assert
      expect(inboxItemService.findOwnedItemOrThrow).toHaveBeenLastCalledWith(
        expect.objectContaining({
          assigneeUserWorkspaceId: OTHER_USER_WORKSPACE_ID,
        }),
      );
    });

    it('should hand the item to the new target unread and unclaimed', async () => {
      // Act
      await service.transition({
        ...transitionArgs,
        transition: {
          kind: 'REASSIGN',
          targetUserWorkspaceId: OTHER_USER_WORKSPACE_ID,
        },
      });

      // Assert
      expect(lastPartialUpdate()).toEqual(
        expect.objectContaining({
          assigneeUserWorkspaceId: OTHER_USER_WORKSPACE_ID,
          readAt: null,
          claimedByUserWorkspaceId: null,
        }),
      );
    });
  });

  describe('SNOOZE', () => {
    it('should defer the item and mark it read', async () => {
      // Act
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'SNOOZE', durationMinutes: 60 },
      });

      // Assert
      expect(lastPartialUpdate()).toEqual(
        expect.objectContaining({
          snoozedUntil: new Date('2026-08-07T11:00:00.000Z'),
          readAt: NOW,
        }),
      );
    });

    it('should refuse a non positive duration', async () => {
      // Act & Assert
      await expect(
        service.transition({
          ...transitionArgs,
          transition: { kind: 'SNOOZE', durationMinutes: 0 },
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('REOPEN', () => {
    it('should refuse to reopen an item that is already open', async () => {
      // Act & Assert
      await expect(
        service.transition({
          ...transitionArgs,
          transition: { kind: 'REOPEN' },
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should clear the resolution and make the item unread again', async () => {
      // Prepare
      inboxItemService.findOwnedItemOrThrow.mockResolvedValue(
        buildInboxItem({ status: InboxItemStatus.RESOLVED }),
      );

      // Act
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'REOPEN' },
      });

      // Assert
      expect(lastPartialUpdate()).toEqual(
        expect.objectContaining({
          status: InboxItemStatus.OPEN,
          outcome: null,
          result: null,
          cancellationReason: null,
          readAt: null,
        }),
      );
    });
  });

  describe('ownership', () => {
    it('should scope the write to the actor, not only the preceding read', async () => {
      // Act
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'RELEASE' },
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
