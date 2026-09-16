import { Test, type TestingModule } from '@nestjs/testing';

import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxExceptionCode } from 'src/engine/core-modules/inbox/inbox.exception';
import { SELF_ASSIGNMENT } from 'src/engine/core-modules/inbox/types/inbox-item-transition.type';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import { InboxTransitionService } from 'src/engine/core-modules/inbox/services/inbox-transition.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = 'workspace-id';
const ACTOR_USER_WORKSPACE_ID = 'actor-user-workspace-id';
const INBOX_ITEM_ID = 'inbox-item-id';
const OTHER_USER_WORKSPACE_ID = 'other-user-workspace-id';
const QUEUE_ID = 'queue-id';
const NOW = new Date('2026-08-07T10:00:00.000Z');

const buildInboxItem = (
  overrides: Partial<InboxItemEntity> = {},
): InboxItemEntity =>
  ({
    id: INBOX_ITEM_ID,
    workspaceId: WORKSPACE_ID,
    assigneeUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
    icon: 'IconCircleCheck',
    lastEventAt: new Date('2026-08-07T09:00:00.000Z'),
    clearedAt: null,
    version: 3,
    ...overrides,
  }) as InboxItemEntity;

const transitionArgs = {
  inboxItemId: INBOX_ITEM_ID,
  workspaceId: WORKSPACE_ID,
  actorUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
  accessibleQueueIds: [],
};

describe('InboxTransitionService', () => {
  let service: InboxTransitionService;

  const inboxItemRepository = { update: jest.fn(), findOne: jest.fn() };
  const userWorkspaceService = { findById: jest.fn() };
  const inboxItemService = {
    findVisibleItemOrThrow: jest.fn(),
    buildWriteScope: jest.fn(),
  };

  const lastPartialUpdate = () =>
    inboxItemRepository.update.mock.calls[0][2] as Record<string, unknown>;

  const lastPredicate = () =>
    inboxItemRepository.update.mock.calls[0][1] as Record<string, unknown>;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(NOW);

    inboxItemRepository.update.mockResolvedValue({ affected: 1 });
    inboxItemService.findVisibleItemOrThrow.mockResolvedValue(buildInboxItem());
    inboxItemRepository.findOne.mockResolvedValue(buildInboxItem());
    userWorkspaceService.findById.mockResolvedValue({
      id: 'someone-else',
      workspaceId: WORKSPACE_ID,
    });
    inboxItemService.buildWriteScope.mockReturnValue({
      id: INBOX_ITEM_ID,
      assigneeUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxTransitionService,
        {
          provide: getWorkspaceScopedRepositoryToken(InboxItemEntity),
          useValue: inboxItemRepository,
        },
        { provide: InboxItemService, useValue: inboxItemService },
        { provide: UserWorkspaceService, useValue: userWorkspaceService },
      ],
    }).compile();

    service = module.get<InboxTransitionService>(InboxTransitionService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('optimistic concurrency', () => {
    it('should put the expected version in the write predicate so a stale caller loses', async () => {
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'CLEAR' },
        expectedVersion: 3,
      });

      expect(lastPredicate()).toEqual(expect.objectContaining({ version: 3 }));
    });

    it('should bump the version on every transition', async () => {
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'CLEAR' },
      });

      const version = lastPartialUpdate().version as () => string;

      expect(version()).toBe('"version" + 1');
    });

    it('should reject when the item moved since it was read', async () => {
      inboxItemRepository.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.transition({
          ...transitionArgs,
          transition: { kind: 'CLEAR' },
          expectedVersion: 2,
        }),
      ).rejects.toMatchObject({
        code: InboxExceptionCode.INBOX_ITEM_CHANGED,
      });
    });

    it('should report the item as gone when it vanished right after the write', async () => {
      inboxItemRepository.findOne.mockResolvedValue(null);

      await expect(
        service.transition({
          ...transitionArgs,
          transition: { kind: 'CLEAR' },
        }),
      ).rejects.toMatchObject({
        code: InboxExceptionCode.INBOX_ITEM_NOT_FOUND,
      });
    });

    it('should apply without a version guard when the caller does not supply one', async () => {
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'CLEAR' },
      });

      expect(lastPredicate()).not.toHaveProperty('version');
    });
  });

  describe('CLEAR', () => {
    it('should stamp who cleared it and count as having seen it', async () => {
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'CLEAR' },
      });

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
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'CLEAR' },
      });

      const partialUpdate = lastPartialUpdate() as Record<string, () => string>;

      expect(partialUpdate.clearedAt()).toBe('clock_timestamp()');
      expect(partialUpdate.readAt()).toBe('clock_timestamp()');
    });

    it('should never write lastEventAt, which only producers own', async () => {
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'CLEAR' },
      });

      expect(lastPartialUpdate()).not.toHaveProperty('lastEventAt');
    });

    it('should apply to an item that was already cleared, since clearing is not a state change', async () => {
      inboxItemService.findVisibleItemOrThrow.mockResolvedValue(
        buildInboxItem({ clearedAt: new Date('2026-08-07T09:30:00.000Z') }),
      );

      await service.transition({
        ...transitionArgs,
        transition: { kind: 'CLEAR' },
      });

      const partialUpdate = lastPartialUpdate() as Record<string, () => string>;

      expect(partialUpdate.clearedAt()).toBe('clock_timestamp()');
    });
  });

  describe('CLEAR with a resurfacing time', () => {
    it('should be a clear that expires rather than a state of its own', async () => {
      await service.transition({
        ...transitionArgs,
        transition: {
          kind: 'CLEAR',
          resurfaceAt: new Date('2026-08-07T11:00:00.000Z'),
        },
      });

      // The resurfacing time is the one timestamp on this side that is not the
      // database's, because it is only ever compared against a reading
      // request's own clock
      expect(lastPartialUpdate()).toEqual(
        expect.objectContaining({
          resurfaceAt: new Date('2026-08-07T11:00:00.000Z'),
        }),
      );
    });

    it('should refuse a time that is not in the future', async () => {
      await expect(
        service.transition({
          ...transitionArgs,
          transition: { kind: 'CLEAR', resurfaceAt: NOW },
        }),
      ).rejects.toMatchObject({
        code: InboxExceptionCode.INVALID_INBOX_ACTION,
      });
    });

    it('should refuse a time more than a year away', async () => {
      await expect(
        service.transition({
          ...transitionArgs,
          transition: {
            kind: 'CLEAR',
            resurfaceAt: new Date('2027-09-07T10:00:00.000Z'),
          },
        }),
      ).rejects.toMatchObject({
        code: InboxExceptionCode.INVALID_INBOX_ACTION,
      });
    });
  });

  describe('REOPEN', () => {
    it('should undo the clear and how it ended', async () => {
      inboxItemService.findVisibleItemOrThrow.mockResolvedValue(
        buildInboxItem({ clearedAt: new Date('2026-08-07T09:30:00.000Z') }),
      );

      await service.transition({
        ...transitionArgs,
        transition: { kind: 'REOPEN' },
      });

      expect(lastPartialUpdate()).toEqual(
        expect.objectContaining({
          clearedAt: null,
          clearedByUserWorkspaceId: null,
          resurfaceAt: null,
        }),
      );
    });

    it('should leave readAt alone, since moving something back is not a reason to unread it', async () => {
      inboxItemService.findVisibleItemOrThrow.mockResolvedValue(
        buildInboxItem({ clearedAt: new Date('2026-08-07T09:30:00.000Z') }),
      );

      await service.transition({
        ...transitionArgs,
        transition: { kind: 'REOPEN' },
      });

      expect(lastPartialUpdate()).not.toHaveProperty('readAt');
    });
  });

  describe('ASSIGN', () => {
    const QUEUE_ITEM = () =>
      buildInboxItem({
        queueId: 'support-queue-id',
        assigneeUserWorkspaceId: null,
      });

    it('should let someone take a queue item', async () => {
      inboxItemService.findVisibleItemOrThrow.mockResolvedValue(QUEUE_ITEM());

      await service.transition({
        ...transitionArgs,
        transition: {
          kind: 'ASSIGN',
          toUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
        },
      });

      expect(lastPartialUpdate()).toEqual(
        expect.objectContaining({
          assigneeUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
        }),
      );
    });

    it('should give a queue item back by assigning it to nobody', async () => {
      inboxItemService.findVisibleItemOrThrow.mockResolvedValue(
        buildInboxItem({
          queueId: 'support-queue-id',
          assigneeUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
        }),
      );

      await service.transition({
        ...transitionArgs,
        transition: { kind: 'ASSIGN', toUserWorkspaceId: null },
      });

      expect(lastPartialUpdate()).toEqual(
        expect.objectContaining({ assigneeUserWorkspaceId: null }),
      );
    });

    // Work is never left with no inbox to sit in
    it('should refuse to unassign an item that has no queue behind it', async () => {
      inboxItemService.findVisibleItemOrThrow.mockResolvedValue(
        buildInboxItem({ queueId: null }),
      );

      await expect(
        service.transition({
          ...transitionArgs,
          transition: { kind: 'ASSIGN', toUserWorkspaceId: null },
        }),
      ).rejects.toMatchObject({
        code: InboxExceptionCode.INVALID_INBOX_ACTION,
      });
    });

    it('should refuse a recipient who is not a member of this workspace', async () => {
      inboxItemService.findVisibleItemOrThrow.mockResolvedValue(QUEUE_ITEM());
      userWorkspaceService.findById.mockResolvedValue({
        id: 'someone-else',
        workspaceId: 'another-workspace-id',
      });

      await expect(
        service.transition({
          ...transitionArgs,
          transition: { kind: 'ASSIGN', toUserWorkspaceId: 'someone-else' },
        }),
      ).rejects.toMatchObject({
        code: InboxExceptionCode.UNKNOWN_INBOX_RECIPIENT,
      });
      expect(inboxItemRepository.update).not.toHaveBeenCalled();
    });

    it('should hand an item to someone else unread, since they have not seen it', async () => {
      inboxItemService.findVisibleItemOrThrow.mockResolvedValue(QUEUE_ITEM());

      await service.transition({
        ...transitionArgs,
        transition: { kind: 'ASSIGN', toUserWorkspaceId: 'someone-else' },
      });

      expect(lastPartialUpdate()).toEqual(
        expect.objectContaining({
          assigneeUserWorkspaceId: 'someone-else',
          readAt: null,
        }),
      );
    });
  });

  describe('ownership', () => {
    it('should scope the write to the actor, not only the preceding read', async () => {
      await service.transition({
        ...transitionArgs,
        transition: { kind: 'CLEAR' },
      });

      expect(lastPredicate()).toEqual(
        expect.objectContaining({
          assigneeUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
        }),
      );
    });
  });

  describe('handing work to someone else', () => {
    it('clears the previous holder snooze so the item is not invisible to the recipient', async () => {
      const snoozedItem = buildInboxItem({
        assigneeUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
        queueId: QUEUE_ID,
        clearedAt: new Date('2026-01-01T00:00:00.000Z'),
        clearedByUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
        resurfaceAt: new Date('2099-01-01T00:00:00.000Z'),
      });

      inboxItemService.findVisibleItemOrThrow.mockResolvedValue(snoozedItem);
      inboxItemRepository.findOne.mockResolvedValue(snoozedItem);
      userWorkspaceService.findById.mockResolvedValue({
        id: OTHER_USER_WORKSPACE_ID,
        workspaceId: WORKSPACE_ID,
      });

      await service.transition({
        inboxItemId: INBOX_ITEM_ID,
        workspaceId: WORKSPACE_ID,
        actorUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
        accessibleQueueIds: [QUEUE_ID],
        transition: {
          kind: 'ASSIGN',
          toUserWorkspaceId: OTHER_USER_WORKSPACE_ID,
        },
      });

      expect(inboxItemRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.anything(),
        expect.objectContaining({
          assigneeUserWorkspaceId: OTHER_USER_WORKSPACE_ID,
          readAt: null,
          clearedAt: null,
          clearedByUserWorkspaceId: null,
          resurfaceAt: null,
        }),
      );
    });

    it('writes nothing at all when the assignee is not actually changing', async () => {
      const clearedItem = buildInboxItem({
        assigneeUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
        queueId: QUEUE_ID,
        clearedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      inboxItemService.findVisibleItemOrThrow.mockResolvedValue(clearedItem);
      inboxItemRepository.findOne.mockResolvedValue(clearedItem);

      await service.transition({
        inboxItemId: INBOX_ITEM_ID,
        workspaceId: WORKSPACE_ID,
        actorUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
        accessibleQueueIds: [QUEUE_ID],
        transition: { kind: 'ASSIGN', toUserWorkspaceId: SELF_ASSIGNMENT },
      });

      expect(inboxItemRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('moving between inboxes', () => {
    it('leaves a personal item with its owner when it goes to a shared inbox', async () => {
      inboxItemService.findVisibleItemOrThrow.mockResolvedValue(
        buildInboxItem({
          queueId: null,
          assigneeUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
        }),
      );

      await service.transition({
        inboxItemId: INBOX_ITEM_ID,
        workspaceId: WORKSPACE_ID,
        actorUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
        accessibleQueueIds: [QUEUE_ID],
        transition: { kind: 'MOVE', toQueueId: QUEUE_ID },
      });

      expect(inboxItemRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.anything(),
        expect.objectContaining({
          queueId: QUEUE_ID,
          assigneeUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
          clearedAt: null,
        }),
      );
    });

    it('keeps unclaimed work addressed by giving it to whoever takes it out of every inbox', async () => {
      inboxItemService.findVisibleItemOrThrow.mockResolvedValue(
        buildInboxItem({ queueId: QUEUE_ID, assigneeUserWorkspaceId: null }),
      );

      await service.transition({
        inboxItemId: INBOX_ITEM_ID,
        workspaceId: WORKSPACE_ID,
        actorUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
        accessibleQueueIds: [QUEUE_ID],
        transition: { kind: 'MOVE', toQueueId: null },
      });

      expect(inboxItemRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.anything(),
        expect.objectContaining({
          queueId: null,
          assigneeUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
        }),
      );
    });

    it('refuses an inbox the actor cannot reach', async () => {
      inboxItemService.findVisibleItemOrThrow.mockResolvedValue(
        buildInboxItem({ queueId: QUEUE_ID }),
      );

      await expect(
        service.transition({
          inboxItemId: INBOX_ITEM_ID,
          workspaceId: WORKSPACE_ID,
          actorUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
          accessibleQueueIds: [QUEUE_ID],
          transition: { kind: 'MOVE', toQueueId: 'a-queue-i-cannot-see' },
        }),
      ).rejects.toThrow('is not one you can reach');

      expect(inboxItemRepository.update).not.toHaveBeenCalled();
    });

    // The slot is unique per inbox, so keeping it would make the move fail
    // whenever the destination already holds an item for the same subject.
    it('gives up the slot so a move cannot collide with the destination', async () => {
      inboxItemService.findVisibleItemOrThrow.mockResolvedValue(
        buildInboxItem({ queueId: null, slotKey: 'thread:abc' }),
      );

      await service.transition({
        inboxItemId: INBOX_ITEM_ID,
        workspaceId: WORKSPACE_ID,
        actorUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
        accessibleQueueIds: [QUEUE_ID],
        transition: { kind: 'MOVE', toQueueId: QUEUE_ID },
      });

      expect(inboxItemRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.anything(),
        expect.objectContaining({ queueId: QUEUE_ID, slotKey: null }),
      );
    });

    // A write would bump the version, and every client holding the item would
    // then have to reload before it could act on it again.
    it('writes nothing at all when the item is already in that inbox', async () => {
      inboxItemService.findVisibleItemOrThrow.mockResolvedValue(
        buildInboxItem({ queueId: QUEUE_ID }),
      );

      await service.transition({
        inboxItemId: INBOX_ITEM_ID,
        workspaceId: WORKSPACE_ID,
        actorUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
        accessibleQueueIds: [QUEUE_ID],
        transition: { kind: 'MOVE', toQueueId: QUEUE_ID },
      });

      expect(inboxItemRepository.update).not.toHaveBeenCalled();
    });
  });
});
