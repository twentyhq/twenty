import { Test, type TestingModule } from '@nestjs/testing';

import { InboxItemToolCallEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-tool-call.entity';
import { InboxItemToolCallStatus } from 'src/engine/core-modules/inbox/enums/inbox-item-tool-call-status.enum';
import { InboxExceptionCode } from 'src/engine/core-modules/inbox/inbox.exception';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import { InboxItemToolCallService } from 'src/engine/core-modules/inbox/services/inbox-item-tool-call.service';
import { InboxToolCallExecutionService } from 'src/engine/core-modules/inbox/services/inbox-tool-call-execution.service';
import { InboxTransitionService } from 'src/engine/core-modules/inbox/services/inbox-transition.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = 'workspace-id';
const ACTOR_USER_WORKSPACE_ID = 'actor-user-workspace-id';
const INBOX_ITEM_ID = 'inbox-item-id';

const buildToolCall = (
  overrides: Partial<InboxItemToolCallEntity>,
): InboxItemToolCallEntity =>
  ({
    id: 'tool-call-id',
    workspaceId: WORKSPACE_ID,
    inboxItemId: INBOX_ITEM_ID,
    position: 0,
    toolName: 'send_email',
    label: 'Send email',
    status: InboxItemToolCallStatus.PROPOSED,
    proposedInput: { to: 'marie@example.com' },
    editedInput: null,
    inputSchema: [],
    resolvedAt: null,
    ...overrides,
  }) as InboxItemToolCallEntity;

describe('InboxItemToolCallService', () => {
  let service: InboxItemToolCallService;

  const inboxItemToolCallRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };
  const inboxItemService = { findVisibleItemOrThrow: jest.fn() };
  const inboxTransitionService = { transition: jest.fn() };
  const inboxToolCallExecutionService = { execute: jest.fn() };

  const actorArgs = {
    workspaceId: WORKSPACE_ID,
    actorUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
    accessibleQueueIds: [],
  };

  // The rows as read before the run, then as read back after it
  const givenToolCalls = (
    before: InboxItemToolCallEntity[],
    after: InboxItemToolCallEntity[],
  ) => {
    inboxItemToolCallRepository.find
      .mockResolvedValueOnce(before)
      .mockResolvedValueOnce(after);
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    inboxItemService.findVisibleItemOrThrow.mockResolvedValue({
      id: INBOX_ITEM_ID,
      version: 3,
    });
    inboxItemToolCallRepository.update.mockResolvedValue({ affected: 1 });
    inboxTransitionService.transition.mockImplementation(
      async ({ transition }) => ({ id: INBOX_ITEM_ID, ...transition }),
    );
    inboxToolCallExecutionService.execute.mockImplementation(
      async ({ input }) => ({ status: 'EXECUTED', output: input }),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxItemToolCallService,
        {
          provide: getWorkspaceScopedRepositoryToken(InboxItemToolCallEntity),
          useValue: inboxItemToolCallRepository,
        },
        { provide: InboxItemService, useValue: inboxItemService },
        { provide: InboxTransitionService, useValue: inboxTransitionService },
        {
          provide: InboxToolCallExecutionService,
          useValue: inboxToolCallExecutionService,
        },
      ],
    }).compile();

    service = module.get<InboxItemToolCallService>(InboxItemToolCallService);
  });

  describe('runAll', () => {
    it('should run the edited input when there is one and clear the item as done', async () => {
      // Prepare
      const first = buildToolCall({
        id: 'first',
        editedInput: { to: 'paul@example.com' },
      });
      const second = buildToolCall({
        id: 'second',
        position: 1,
        toolName: 'create_person',
      });

      givenToolCalls(
        [first, second],
        [
          { ...first, status: InboxItemToolCallStatus.EXECUTED },
          { ...second, status: InboxItemToolCallStatus.EXECUTED },
        ],
      );

      // Act
      const inboxItem = await service.runAll({
        ...actorArgs,
        inboxItemId: INBOX_ITEM_ID,
        expectedVersion: 3,
      });

      // Assert
      expect(inboxToolCallExecutionService.execute).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ input: { to: 'paul@example.com' } }),
      );
      expect(inboxToolCallExecutionService.execute).toHaveBeenCalledTimes(2);
      expect(inboxTransitionService.transition).toHaveBeenCalledWith(
        expect.objectContaining({
          transition: { kind: 'CLEAR', outcome: 'DONE' },
          expectedVersion: 3,
        }),
      );
      expect(inboxItem).toMatchObject({ outcome: 'DONE' });
    });

    it('should claim each call before running it', async () => {
      // Prepare
      const first = buildToolCall({ id: 'first' });

      givenToolCalls(
        [first],
        [{ ...first, status: InboxItemToolCallStatus.EXECUTED }],
      );

      // Act
      await service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID });

      // Assert
      expect(inboxItemToolCallRepository.update).toHaveBeenNthCalledWith(
        1,
        WORKSPACE_ID,
        expect.objectContaining({
          id: 'first',
          status: InboxItemToolCallStatus.PROPOSED,
        }),
        expect.objectContaining({
          resolvedByUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
        }),
      );
    });

    // Two people pressing the button at once must not send the email twice
    it('should not run a call another run claimed first', async () => {
      // Prepare
      const first = buildToolCall({ id: 'first' });

      givenToolCalls([first], [first]);
      inboxItemToolCallRepository.update.mockResolvedValue({ affected: 0 });

      // Act
      await service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID });

      // Assert
      expect(inboxToolCallExecutionService.execute).not.toHaveBeenCalled();
      expect(inboxTransitionService.transition).not.toHaveBeenCalled();
    });

    // A skipped step is the person's veto, and the outcome should say so
    it('should clear the item as partial when a step was skipped', async () => {
      // Prepare
      const first = buildToolCall({ id: 'first' });
      const second = buildToolCall({
        id: 'second',
        position: 1,
        status: InboxItemToolCallStatus.REJECTED,
      });

      givenToolCalls(
        [first, second],
        [{ ...first, status: InboxItemToolCallStatus.EXECUTED }, second],
      );

      // Act
      await service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID });

      // Assert
      expect(inboxToolCallExecutionService.execute).toHaveBeenCalledTimes(1);
      expect(inboxTransitionService.transition).toHaveBeenCalledWith(
        expect.objectContaining({
          transition: { kind: 'CLEAR', outcome: 'PARTIAL' },
        }),
      );
    });

    it('should clear the item as partial when every step was skipped', async () => {
      // Prepare
      const first = buildToolCall({
        id: 'first',
        status: InboxItemToolCallStatus.REJECTED,
      });

      givenToolCalls([first], [first]);

      // Act
      await service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID });

      // Assert
      expect(inboxToolCallExecutionService.execute).not.toHaveBeenCalled();
      expect(inboxTransitionService.transition).toHaveBeenCalledWith(
        expect.objectContaining({
          transition: { kind: 'CLEAR', outcome: 'PARTIAL' },
        }),
      );
    });

    it('should leave the item in the inbox when a step fails', async () => {
      // Prepare
      const first = buildToolCall({ id: 'first' });

      givenToolCalls(
        [first],
        [
          {
            ...first,
            status: InboxItemToolCallStatus.FAILED,
            error: 'Mailbox not connected',
          },
        ],
      );
      inboxToolCallExecutionService.execute.mockResolvedValue({
        status: 'FAILED',
        error: 'Mailbox not connected',
      });

      // Act
      await service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID });

      // Assert
      expect(inboxItemToolCallRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: 'first' },
        expect.objectContaining({
          status: InboxItemToolCallStatus.FAILED,
          error: 'Mailbox not connected',
        }),
      );
      expect(inboxTransitionService.transition).not.toHaveBeenCalled();
    });

    it('should leave the item in the inbox while an earlier failure stands', async () => {
      // Prepare
      const failed = buildToolCall({
        id: 'failed',
        status: InboxItemToolCallStatus.FAILED,
      });
      const second = buildToolCall({ id: 'second', position: 1 });

      givenToolCalls(
        [failed, second],
        [failed, { ...second, status: InboxItemToolCallStatus.EXECUTED }],
      );

      // Act
      await service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID });

      // Assert
      expect(inboxToolCallExecutionService.execute).toHaveBeenCalledTimes(1);
      expect(inboxTransitionService.transition).not.toHaveBeenCalled();
    });

    it('should refuse to run a call missing a required field', async () => {
      // Prepare
      givenToolCalls(
        [
          buildToolCall({
            inputSchema: [
              { key: 'to', label: 'To', type: 'TEXT', isRequired: true },
            ],
            editedInput: { subject: 'Hello' },
          }),
        ],
        [],
      );

      // Act & Assert
      await expect(
        service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID }),
      ).rejects.toMatchObject({
        code: InboxExceptionCode.INVALID_INBOX_TOOL_CALL_INPUT,
      });
      expect(inboxToolCallExecutionService.execute).not.toHaveBeenCalled();
    });

    it('should refuse to run a plan that changed since it was read', async () => {
      // Act & Assert
      await expect(
        service.runAll({
          ...actorArgs,
          inboxItemId: INBOX_ITEM_ID,
          expectedVersion: 2,
        }),
      ).rejects.toMatchObject({
        code: InboxExceptionCode.INBOX_ITEM_CHANGED,
      });
      expect(inboxToolCallExecutionService.execute).not.toHaveBeenCalled();
    });
  });

  describe('setRejected', () => {
    it('should refuse to skip a step that already ran', async () => {
      // Prepare
      inboxItemToolCallRepository.findOne.mockResolvedValue(
        buildToolCall({ status: InboxItemToolCallStatus.EXECUTED }),
      );

      // Act & Assert
      await expect(
        service.setRejected({
          ...actorArgs,
          inboxItemToolCallId: 'tool-call-id',
          isRejected: true,
        }),
      ).rejects.toMatchObject({
        code: InboxExceptionCode.INBOX_ITEM_CHANGED,
      });
      expect(inboxItemToolCallRepository.update).not.toHaveBeenCalled();
    });

    it('should refuse to skip a step that ran between the read and the write', async () => {
      // Prepare
      inboxItemToolCallRepository.findOne.mockResolvedValue(buildToolCall({}));
      inboxItemToolCallRepository.update.mockResolvedValue({ affected: 0 });

      // Act & Assert
      await expect(
        service.setRejected({
          ...actorArgs,
          inboxItemToolCallId: 'tool-call-id',
          isRejected: true,
        }),
      ).rejects.toMatchObject({
        code: InboxExceptionCode.INBOX_ITEM_CHANGED,
      });
      expect(inboxItemToolCallRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: 'tool-call-id', status: InboxItemToolCallStatus.PROPOSED },
        expect.anything(),
      );
    });
  });
});
