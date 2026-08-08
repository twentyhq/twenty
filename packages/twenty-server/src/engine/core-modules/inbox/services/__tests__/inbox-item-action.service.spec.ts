import { BadRequestException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { type InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import { type InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemActionService } from 'src/engine/core-modules/inbox/services/inbox-item-action.service';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import { InboxTransitionService } from 'src/engine/core-modules/inbox/services/inbox-transition.service';
import { type InboxItemAction } from 'src/engine/core-modules/inbox/types/inbox-item-action.type';

const WORKSPACE_ID = 'workspace-id';
const ACTOR_USER_WORKSPACE_ID = 'actor-user-workspace-id';
const INBOX_ITEM_ID = 'inbox-item-id';

const DECLARED_ACTIONS: InboxItemAction[] = [
  { key: 'open', label: 'Open', navigation: { kind: 'OPEN_THREAD' } },
  {
    key: 'approve',
    label: 'Approve',
    transition: { kind: 'CLEAR', outcome: 'APPROVED' },
  },
  {
    key: 'requestChanges',
    label: 'Request changes',
    inputSchema: [
      {
        key: 'feedback',
        label: 'Feedback',
        type: 'LONG_TEXT',
        isRequired: true,
      },
    ],
    transition: { kind: 'CLEAR', outcome: 'CHANGES_REQUESTED' },
  },
  {
    key: 'snooze',
    label: 'Snooze for an hour',
    transition: { kind: 'CLEAR', resurfaceInMinutes: 60 },
  },
  {
    key: 'score',
    label: 'Score',
    inputSchema: [
      { key: 'rating', label: 'Rating', type: 'NUMBER' },
      { key: 'isUrgent', label: 'Is urgent', type: 'BOOLEAN' },
    ],
    transition: { kind: 'CLEAR', outcome: 'SCORED' },
  },
];

const inboxItem = {
  id: INBOX_ITEM_ID,
  workspaceId: WORKSPACE_ID,
  assigneeUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
  inboxItemType: {
    id: 'inbox-item-type-id',
    key: 'approval',
    actions: DECLARED_ACTIONS,
  } as InboxItemTypeEntity,
} as InboxItemEntity;

const executeArgs = {
  inboxItemId: INBOX_ITEM_ID,
  workspaceId: WORKSPACE_ID,
  actorUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
};

describe('InboxItemActionService', () => {
  let service: InboxItemActionService;

  const inboxItemService = { findOwnedItemOrThrow: jest.fn() };
  const inboxTransitionService = { transition: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    inboxItemService.findOwnedItemOrThrow.mockResolvedValue(inboxItem);
    inboxTransitionService.transition.mockResolvedValue(inboxItem);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxItemActionService,
        { provide: InboxItemService, useValue: inboxItemService },
        { provide: InboxTransitionService, useValue: inboxTransitionService },
      ],
    }).compile();

    service = module.get<InboxItemActionService>(InboxItemActionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hand the declared transition to the transition service', async () => {
    // Act
    await service.execute({ ...executeArgs, actionKey: 'approve' });

    // Assert
    expect(inboxTransitionService.transition).toHaveBeenCalledWith(
      expect.objectContaining({
        inboxItemId: INBOX_ITEM_ID,
        actorUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
        transition: { kind: 'CLEAR', outcome: 'APPROVED' },
      }),
    );
  });

  it('should carry what the action collected through as the result', async () => {
    // Act
    await service.execute({
      ...executeArgs,
      actionKey: 'requestChanges',
      input: { feedback: 'Make it shorter' },
    });

    // Assert
    expect(inboxTransitionService.transition).toHaveBeenCalledWith(
      expect.objectContaining({
        transition: {
          kind: 'CLEAR',
          outcome: 'CHANGES_REQUESTED',
          result: { feedback: 'Make it shorter' },
        },
      }),
    );
  });

  it('should refuse an action whose required input is missing', async () => {
    // Act & Assert
    await expect(
      service.execute({ ...executeArgs, actionKey: 'requestChanges' }),
    ).rejects.toThrow(BadRequestException);
    expect(inboxTransitionService.transition).not.toHaveBeenCalled();
  });

  it('should refuse an action whose required input is blank', async () => {
    // Act & Assert
    await expect(
      service.execute({
        ...executeArgs,
        actionKey: 'requestChanges',
        input: { feedback: '' },
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should pass an action that collects nothing through untouched', async () => {
    // Act
    await service.execute({ ...executeArgs, actionKey: 'snooze' });

    // Assert
    expect(inboxTransitionService.transition).toHaveBeenCalledWith(
      expect.objectContaining({
        transition: { kind: 'CLEAR', resurfaceInMinutes: 60 },
      }),
    );
  });

  it('should forward the expected version so a stale action loses', async () => {
    // Act
    await service.execute({
      ...executeArgs,
      actionKey: 'approve',
      expectedVersion: 7,
    });

    // Assert
    expect(inboxTransitionService.transition).toHaveBeenCalledWith(
      expect.objectContaining({ expectedVersion: 7 }),
    );
  });

  it('should refuse an action the client is supposed to resolve itself', async () => {
    // Act & Assert
    await expect(
      service.execute({ ...executeArgs, actionKey: 'open' }),
    ).rejects.toThrow(BadRequestException);
    expect(inboxTransitionService.transition).not.toHaveBeenCalled();
  });

  it('should refuse an action the type does not declare', async () => {
    // Act & Assert
    await expect(
      service.execute({ ...executeArgs, actionKey: 'nope' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should coerce a declared number and boolean to their declared types', async () => {
    // Act
    await service.execute({
      ...executeArgs,
      actionKey: 'score',
      input: { rating: '4', isUrgent: 'true' },
    });

    // Assert
    expect(inboxTransitionService.transition).toHaveBeenCalledWith(
      expect.objectContaining({
        transition: expect.objectContaining({
          result: { rating: 4, isUrgent: true },
        }),
      }),
    );
  });

  it('should refuse a blank number rather than resolving it as zero', async () => {
    // Act & Assert
    await expect(
      service.execute({
        ...executeArgs,
        actionKey: 'score',
        input: { rating: '  ' },
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should refuse a boolean that is neither true nor false', async () => {
    // Act & Assert
    await expect(
      service.execute({
        ...executeArgs,
        actionKey: 'score',
        input: { isUrgent: 'yes' },
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
