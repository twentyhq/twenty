import { BadRequestException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import { type InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemActionService } from 'src/engine/core-modules/inbox/services/inbox-item-action.service';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import { type InboxItemAction } from 'src/engine/core-modules/inbox/types/inbox-item-action.type';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = 'workspace-id';
const ASSIGNEE_USER_WORKSPACE_ID = 'assignee-user-workspace-id';
const INBOX_ITEM_ID = 'inbox-item-id';
const INBOX_ITEM_TYPE_ID = 'inbox-item-type-id';
const NOW = new Date('2026-08-07T10:00:00.000Z');
const SNOOZE_DURATION_MINUTES = 60;

const DECLARED_ACTIONS: InboxItemAction[] = [
  { key: 'open', label: 'Open', handler: { kind: 'OPEN_THREAD' } },
  {
    key: 'openRun',
    label: 'Open run',
    handler: { kind: 'OPEN_SUBJECT_RECORD' },
  },
  { key: 'done', label: 'Mark done', handler: { kind: 'COMPLETE' } },
  {
    key: 'snooze',
    label: 'Snooze for an hour',
    handler: { kind: 'SNOOZE', durationMinutes: SNOOZE_DURATION_MINUTES },
  },
];

const inboxItem = {
  id: INBOX_ITEM_ID,
  workspaceId: WORKSPACE_ID,
  inboxItemTypeId: INBOX_ITEM_TYPE_ID,
  assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
} as InboxItemEntity;

const inboxItemType = {
  id: INBOX_ITEM_TYPE_ID,
  key: 'agent_question',
  actions: DECLARED_ACTIONS,
} as InboxItemTypeEntity;

const ownedItemArgs = {
  inboxItemId: INBOX_ITEM_ID,
  workspaceId: WORKSPACE_ID,
  assigneeUserWorkspaceId: ASSIGNEE_USER_WORKSPACE_ID,
};

describe('InboxItemActionService', () => {
  let service: InboxItemActionService;

  const inboxItemTypeRepository = {
    findOneBy: jest.fn(),
  };

  const inboxItemService = {
    findOwnedItemOrThrow: jest.fn(),
    complete: jest.fn(),
    snooze: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(NOW);

    inboxItemTypeRepository.findOneBy.mockResolvedValue(inboxItemType);
    inboxItemService.findOwnedItemOrThrow.mockResolvedValue(inboxItem);
    inboxItemService.complete.mockResolvedValue(inboxItem);
    inboxItemService.snooze.mockResolvedValue(inboxItem);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxItemActionService,
        {
          provide: getWorkspaceScopedRepositoryToken(InboxItemTypeEntity),
          useValue: inboxItemTypeRepository,
        },
        {
          provide: InboxItemService,
          useValue: inboxItemService,
        },
      ],
    }).compile();

    service = module.get<InboxItemActionService>(InboxItemActionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should complete the item when the declared action is a COMPLETE action', async () => {
      // Act
      const result = await service.execute({
        ...ownedItemArgs,
        actionKey: 'done',
      });

      // Assert
      expect(inboxItemService.findOwnedItemOrThrow).toHaveBeenCalledWith(
        ownedItemArgs,
      );
      expect(inboxItemTypeRepository.findOneBy).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: INBOX_ITEM_TYPE_ID },
      );
      expect(inboxItemService.complete).toHaveBeenCalledWith(ownedItemArgs);
      expect(inboxItemService.snooze).not.toHaveBeenCalled();
      expect(result).toEqual(inboxItem);
    });

    it('should snooze the item for the declared duration when the declared action is a SNOOZE action', async () => {
      // Act
      await service.execute({ ...ownedItemArgs, actionKey: 'snooze' });

      // Assert
      expect(inboxItemService.snooze).toHaveBeenCalledWith({
        ...ownedItemArgs,
        snoozedUntil: new Date(
          NOW.getTime() + SNOOZE_DURATION_MINUTES * 60 * 1000,
        ),
      });
      expect(inboxItemService.complete).not.toHaveBeenCalled();
    });

    it('should throw a BadRequestException when the type does not declare the action key', async () => {
      // Act & Assert
      await expect(
        service.execute({ ...ownedItemArgs, actionKey: 'escalate' }),
      ).rejects.toThrow(
        new BadRequestException('Unknown action escalate for this inbox item'),
      );
      expect(inboxItemService.complete).not.toHaveBeenCalled();
      expect(inboxItemService.snooze).not.toHaveBeenCalled();
    });

    it('should throw a BadRequestException when the inbox item type row is missing', async () => {
      // Prepare
      inboxItemTypeRepository.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.execute({ ...ownedItemArgs, actionKey: 'done' }),
      ).rejects.toThrow(BadRequestException);
    });

    it.each([
      ['open', 'OPEN_THREAD'],
      ['openRun', 'OPEN_SUBJECT_RECORD'],
    ])(
      'should throw a BadRequestException for %s when the action kind %s is resolved by the client',
      async (actionKey) => {
        // Act & Assert
        await expect(
          service.execute({ ...ownedItemArgs, actionKey }),
        ).rejects.toThrow(
          new BadRequestException(
            `Action ${actionKey} is resolved by the client`,
          ),
        );
        expect(inboxItemService.complete).not.toHaveBeenCalled();
        expect(inboxItemService.snooze).not.toHaveBeenCalled();
      },
    );

    it('should throw a BadRequestException naming the kind when the declared handler kind has no dispatcher', async () => {
      // Prepare
      // Actions are unvalidated jsonb, so an app can declare a handler kind
      // this server has never heard of
      inboxItemTypeRepository.findOneBy.mockResolvedValue({
        id: INBOX_ITEM_TYPE_ID,
        actions: [
          {
            key: 'runWorkflow',
            label: 'Run workflow',
            handler: { kind: 'RUN_WORKFLOW' },
          },
        ],
      } as unknown as InboxItemTypeEntity);

      // Act & Assert
      await expect(
        service.execute({ ...ownedItemArgs, actionKey: 'runWorkflow' }),
      ).rejects.toThrow(
        new BadRequestException(
          'Action runWorkflow has unsupported handler kind RUN_WORKFLOW',
        ),
      );
      expect(inboxItemService.complete).not.toHaveBeenCalled();
      expect(inboxItemService.snooze).not.toHaveBeenCalled();
    });

    it('should not look the action up when the item is not owned by the caller', async () => {
      // Prepare
      inboxItemService.findOwnedItemOrThrow.mockRejectedValue(
        new Error('Inbox item not found'),
      );

      // Act & Assert
      await expect(
        service.execute({ ...ownedItemArgs, actionKey: 'done' }),
      ).rejects.toThrow('Inbox item not found');
      expect(inboxItemTypeRepository.findOneBy).not.toHaveBeenCalled();
      expect(inboxItemService.complete).not.toHaveBeenCalled();
    });
  });
});
