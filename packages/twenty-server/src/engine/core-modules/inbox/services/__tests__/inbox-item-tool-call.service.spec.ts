import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';

import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemToolCallEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-tool-call.entity';
import { InboxItemToolCallStatus } from 'src/engine/core-modules/inbox/enums/inbox-item-tool-call-status.enum';
import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import { InboxItemToolCallService } from 'src/engine/core-modules/inbox/services/inbox-item-tool-call.service';
import { InboxToolCallExecutionService } from 'src/engine/core-modules/inbox/services/inbox-tool-call-execution.service';
import { TOOL_CALL_CLAIM_TIMEOUT_MS } from 'src/engine/core-modules/inbox/utils/inbox-tool-call-claim.util';
import { InboxTransitionService } from 'src/engine/core-modules/inbox/services/inbox-transition.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { InboxItemFieldType } from 'src/engine/core-modules/inbox/enums/inbox-item-field-type.enum';

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
    insertAndReturnOne: jest.fn(),
    withManager: jest.fn(),
  };
  const inboxItemRepository = { findOne: jest.fn(), withManager: jest.fn() };
  const coreDataSource = {
    transaction: jest.fn((run: (manager: unknown) => unknown) => run({})),
  };
  const inboxItemService = {
    findVisibleItemOrThrow: jest.fn(),
    buildWriteScope: jest.fn(),
  };
  const inboxTransitionService = { transition: jest.fn() };
  const inboxToolCallExecutionService = { execute: jest.fn() };

  const actorArgs = {
    workspaceId: WORKSPACE_ID,
    actorUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
    accessibleQueueIds: [],
  };

  // The time the run stamped on a row when it claimed it, as the database
  // would hand it back
  const claimTimeOf = (toolCallId: string): Date | null => {
    const claim = [...inboxItemToolCallRepository.update.mock.calls]
      .reverse()
      .find(
        ([, where, patch]) =>
          where.id === toolCallId &&
          patch.status === undefined &&
          patch.resolvedAt instanceof Date,
      );

    return claim?.[2].resolvedAt ?? null;
  };

  // The rows as read before the run, then as read back after it. A claimed
  // row is read again by id before it executes, from the pre-run set unless a
  // test overrides it
  const givenToolCalls = (
    before: InboxItemToolCallEntity[],
    after: InboxItemToolCallEntity[],
  ) => {
    inboxItemToolCallRepository.find
      .mockResolvedValueOnce(before)
      .mockResolvedValueOnce(after);
    inboxItemToolCallRepository.findOne.mockImplementation(
      async (_workspaceId: string, options: { where: { id: string } }) => {
        const toolCall = before.find(
          (candidate) => candidate.id === options.where.id,
        );

        return isDefined(toolCall)
          ? { ...toolCall, resolvedAt: claimTimeOf(toolCall.id) }
          : null;
      },
    );
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    inboxItemService.findVisibleItemOrThrow.mockResolvedValue({
      id: INBOX_ITEM_ID,
      version: 3,
    });
    inboxItemToolCallRepository.update.mockResolvedValue({ affected: 1 });
    inboxItemToolCallRepository.withManager.mockReturnValue(
      inboxItemToolCallRepository,
    );
    inboxItemRepository.withManager.mockReturnValue(inboxItemRepository);
    inboxItemRepository.findOne.mockResolvedValue({ id: INBOX_ITEM_ID });
    inboxItemService.buildWriteScope.mockImplementation(
      ({ inboxItem, actorUserWorkspaceId }) => ({
        id: inboxItem.id,
        assigneeUserWorkspaceId: actorUserWorkspaceId,
      }),
    );
    coreDataSource.transaction.mockImplementation(
      (run: (manager: unknown) => unknown) => run({}),
    );
    inboxTransitionService.transition.mockImplementation(
      async ({ transition }) => ({ id: INBOX_ITEM_ID, ...transition }),
    );
    inboxToolCallExecutionService.execute.mockImplementation(
      async ({ input }) => ({ status: 'EXECUTED', output: input }),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxItemToolCallService,
        { provide: getDataSourceToken(), useValue: coreDataSource },
        {
          provide: getWorkspaceScopedRepositoryToken(InboxItemEntity),
          useValue: inboxItemRepository,
        },
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
    it('should run the edited input when there is one and clear the item', async () => {
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

      await service.runAll({
        ...actorArgs,
        inboxItemId: INBOX_ITEM_ID,
        expectedVersion: 3,
      });

      expect(inboxToolCallExecutionService.execute).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ input: { to: 'paul@example.com' } }),
      );
      expect(inboxToolCallExecutionService.execute).toHaveBeenCalledTimes(2);
      expect(inboxTransitionService.transition).toHaveBeenCalledWith(
        expect.objectContaining({
          transition: { kind: 'CLEAR' },
        }),
      );
    });

    // An event folded into the plan while its calls were running must stay
    // visible: the clear is guarded on the version the run started from
    it('should guard the clear on the version the run started from', async () => {
      const first = buildToolCall({ id: 'first' });

      givenToolCalls(
        [first],
        [{ ...first, status: InboxItemToolCallStatus.EXECUTED }],
      );
      inboxItemService.findVisibleItemOrThrow
        .mockResolvedValueOnce({ id: INBOX_ITEM_ID, version: 3 })
        .mockResolvedValueOnce({ id: INBOX_ITEM_ID, version: 4 });

      await service.runAll({
        ...actorArgs,
        inboxItemId: INBOX_ITEM_ID,
        expectedVersion: 3,
      });

      expect(inboxTransitionService.transition).toHaveBeenCalledWith(
        expect.objectContaining({
          expectedVersion: 3,
          loadedInboxItem: { id: INBOX_ITEM_ID, version: 4 },
        }),
      );
    });

    it('should return the item rather than fail when the clear loses its guard', async () => {
      const first = buildToolCall({ id: 'first' });

      givenToolCalls(
        [first],
        [{ ...first, status: InboxItemToolCallStatus.EXECUTED }],
      );
      inboxTransitionService.transition.mockRejectedValue(
        new InboxException('changed', InboxExceptionCode.INBOX_ITEM_CHANGED),
      );

      const inboxItem = await service.runAll({
        ...actorArgs,
        inboxItemId: INBOX_ITEM_ID,
      });

      expect(inboxItem).toEqual({ id: INBOX_ITEM_ID, version: 3 });
    });

    it('should refuse to run an optional number left as an empty string', async () => {
      inboxItemToolCallRepository.find.mockResolvedValueOnce([
        buildToolCall({
          inputSchema: [
            {
              key: 'amount',
              label: 'Amount',
              type: InboxItemFieldType.NUMBER,
              isRequired: false,
            },
          ],
          editedInput: { amount: '' },
        }),
      ]);

      await expect(
        service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID }),
      ).rejects.toMatchObject({
        code: InboxExceptionCode.INVALID_INBOX_TOOL_CALL_INPUT,
      });
    });

    it('should claim each call before running it', async () => {
      const first = buildToolCall({ id: 'first' });

      givenToolCalls(
        [first],
        [{ ...first, status: InboxItemToolCallStatus.EXECUTED }],
      );

      await service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID });

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
      expect(
        inboxItemToolCallRepository.update.mock.invocationCallOrder[0],
      ).toBeLessThan(
        inboxToolCallExecutionService.execute.mock.invocationCallOrder[0],
      );
    });

    // An edit that landed between the first read and the claim is what runs
    it('should run the input as it is after the claim', async () => {
      const first = buildToolCall({ id: 'first' });

      givenToolCalls(
        [first],
        [{ ...first, status: InboxItemToolCallStatus.EXECUTED }],
      );
      inboxItemToolCallRepository.findOne.mockImplementation(async () => ({
        ...first,
        editedInput: { to: 'late@example.com' },
        resolvedAt: claimTimeOf(first.id),
      }));

      await service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID });

      expect(inboxToolCallExecutionService.execute).toHaveBeenCalledWith(
        expect.objectContaining({ input: { to: 'late@example.com' } }),
      );
    });

    // A claim that went stale can be taken over; the late worker must not run
    // the call or write over the new holder
    it('should not run a call that was taken over after its claim', async () => {
      const first = buildToolCall({ id: 'first' });

      givenToolCalls([first], [first]);
      inboxItemToolCallRepository.findOne.mockResolvedValue({
        ...first,
        resolvedAt: new Date(0),
      });

      await service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID });

      expect(inboxToolCallExecutionService.execute).not.toHaveBeenCalled();
      expect(inboxItemToolCallRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should write the result only onto the row it still holds', async () => {
      const first = buildToolCall({ id: 'first' });

      givenToolCalls(
        [first],
        [{ ...first, status: InboxItemToolCallStatus.EXECUTED }],
      );

      await service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID });

      expect(inboxItemToolCallRepository.update).toHaveBeenLastCalledWith(
        WORKSPACE_ID,
        {
          id: 'first',
          status: InboxItemToolCallStatus.PROPOSED,
          resolvedAt: claimTimeOf('first'),
        },
        expect.objectContaining({ status: InboxItemToolCallStatus.EXECUTED }),
      );
    });

    it('should mark an item with no tool calls done without running anything', async () => {
      givenToolCalls([], []);

      await service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID });

      expect(inboxToolCallExecutionService.execute).not.toHaveBeenCalled();
      expect(inboxTransitionService.transition).toHaveBeenCalledWith(
        expect.objectContaining({
          transition: { kind: 'CLEAR' },
        }),
      );
    });

    // Losing a claim means another run is ahead in the plan; the later calls
    // are its to run, in order
    it('should stop at a lost claim rather than run the calls after it', async () => {
      const first = buildToolCall({ id: 'first' });
      const second = buildToolCall({ id: 'second', position: 1 });

      givenToolCalls([first, second], [first, second]);
      inboxItemToolCallRepository.update.mockResolvedValueOnce({ affected: 0 });

      await service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID });

      expect(inboxToolCallExecutionService.execute).not.toHaveBeenCalled();
      expect(inboxItemToolCallRepository.update).toHaveBeenCalledTimes(1);
      expect(inboxTransitionService.transition).not.toHaveBeenCalled();
    });

    // Two people pressing the button at once must not send the email twice
    it('should not run a call another run claimed first', async () => {
      const first = buildToolCall({ id: 'first' });

      givenToolCalls([first], [first]);
      inboxItemToolCallRepository.update.mockResolvedValue({ affected: 0 });

      await service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID });

      expect(inboxToolCallExecutionService.execute).not.toHaveBeenCalled();
      expect(inboxTransitionService.transition).not.toHaveBeenCalled();
    });

    // A skipped step is the person's veto; the plan still ends without it
    it('should clear the item when a step was skipped', async () => {
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

      await service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID });

      expect(inboxToolCallExecutionService.execute).toHaveBeenCalledTimes(1);
      expect(inboxTransitionService.transition).toHaveBeenCalledWith(
        expect.objectContaining({
          transition: { kind: 'CLEAR' },
        }),
      );
    });

    it('should clear the item when every step was skipped', async () => {
      const first = buildToolCall({
        id: 'first',
        status: InboxItemToolCallStatus.REJECTED,
      });

      givenToolCalls([first], [first]);

      await service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID });

      expect(inboxToolCallExecutionService.execute).not.toHaveBeenCalled();
      expect(inboxTransitionService.transition).toHaveBeenCalledWith(
        expect.objectContaining({
          transition: { kind: 'CLEAR' },
        }),
      );
    });

    it('should leave the item in the inbox when a step fails', async () => {
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

      await service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID });

      expect(inboxItemToolCallRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ id: 'first' }),
        expect.objectContaining({
          status: InboxItemToolCallStatus.FAILED,
          error: 'Mailbox not connected',
        }),
      );
      expect(inboxTransitionService.transition).not.toHaveBeenCalled();
    });

    it('should record a throwing executor as a failed call', async () => {
      const first = buildToolCall({ id: 'first' });

      givenToolCalls(
        [first],
        [{ ...first, status: InboxItemToolCallStatus.FAILED }],
      );
      inboxToolCallExecutionService.execute.mockRejectedValue(
        new Error('Mail provider timed out'),
      );

      await service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID });

      expect(inboxItemToolCallRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ id: 'first' }),
        expect.objectContaining({
          status: InboxItemToolCallStatus.FAILED,
          error: 'Mail provider timed out',
        }),
      );
      expect(inboxTransitionService.transition).not.toHaveBeenCalled();
    });

    it('should leave the item in the inbox while an earlier failure stands', async () => {
      const failed = buildToolCall({
        id: 'failed',
        status: InboxItemToolCallStatus.FAILED,
      });
      const second = buildToolCall({ id: 'second', position: 1 });

      givenToolCalls(
        [failed, second],
        [failed, { ...second, status: InboxItemToolCallStatus.EXECUTED }],
      );

      await service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID });

      expect(inboxToolCallExecutionService.execute).toHaveBeenCalledTimes(1);
      expect(inboxTransitionService.transition).not.toHaveBeenCalled();
    });

    it('should refuse to run a call missing a required field', async () => {
      inboxItemToolCallRepository.find.mockResolvedValueOnce([
        buildToolCall({
          inputSchema: [
            {
              key: 'to',
              label: 'To',
              type: InboxItemFieldType.TEXT,
              isRequired: true,
            },
          ],
          editedInput: { subject: 'Hello' },
        }),
      ]);

      await expect(
        service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID }),
      ).rejects.toMatchObject({
        code: InboxExceptionCode.INVALID_INBOX_TOOL_CALL_INPUT,
      });
      expect(inboxToolCallExecutionService.execute).not.toHaveBeenCalled();
    });

    it('should refuse to run a call whose input has the wrong type', async () => {
      inboxItemToolCallRepository.find.mockResolvedValueOnce([
        buildToolCall({
          inputSchema: [
            {
              key: 'amount',
              label: 'Amount',
              type: InboxItemFieldType.NUMBER,
              isRequired: true,
            },
          ],
          editedInput: { amount: 'twelve' },
        }),
      ]);

      await expect(
        service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID }),
      ).rejects.toMatchObject({
        code: InboxExceptionCode.INVALID_INBOX_TOOL_CALL_INPUT,
      });
      expect(inboxToolCallExecutionService.execute).not.toHaveBeenCalled();
    });

    it('should refuse to run a plan that changed since it was read', async () => {
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

  describe('runOne', () => {
    // The row as the run reads it before the claim, then as it reads it back
    // by id once claimed
    const givenSingleToolCall = (
      toolCall: InboxItemToolCallEntity,
      after: InboxItemToolCallEntity[],
    ) => {
      inboxItemToolCallRepository.findOne.mockImplementation(
        async (_workspaceId: string, options: { where: { id: string } }) =>
          options.where.id === toolCall.id
            ? { ...toolCall, resolvedAt: claimTimeOf(toolCall.id) }
            : null,
      );
      inboxItemToolCallRepository.find.mockResolvedValueOnce(after);
    };

    it('should run only the call asked for and clear the item when nothing is left proposed', async () => {
      const reply = buildToolCall({ id: 'reply' });

      givenSingleToolCall(reply, [
        { ...reply, status: InboxItemToolCallStatus.EXECUTED },
      ]);

      await service.runOne({
        ...actorArgs,
        inboxItemToolCallId: 'reply',
        expectedVersion: 3,
      });

      expect(inboxToolCallExecutionService.execute).toHaveBeenCalledTimes(1);
      expect(inboxToolCallExecutionService.execute).toHaveBeenCalledWith(
        expect.objectContaining({ toolName: 'send_email' }),
      );
      expect(inboxTransitionService.transition).toHaveBeenCalledWith(
        expect.objectContaining({
          expectedVersion: 3,
          transition: { kind: 'CLEAR' },
        }),
      );
    });

    // Sending a reply must not commit the person to the steps beside it.
    it('should leave the item in the inbox while another call is still proposed', async () => {
      const reply = buildToolCall({ id: 'reply' });
      const task = buildToolCall({
        id: 'task',
        position: 1,
        toolName: 'create_task',
      });

      givenSingleToolCall(reply, [
        { ...reply, status: InboxItemToolCallStatus.EXECUTED },
        task,
      ]);

      await service.runOne({ ...actorArgs, inboxItemToolCallId: 'reply' });

      expect(inboxToolCallExecutionService.execute).toHaveBeenCalledTimes(1);
      expect(inboxTransitionService.transition).not.toHaveBeenCalled();
    });

    it('should refuse to run a call another run claimed first', async () => {
      const reply = buildToolCall({ id: 'reply' });

      givenSingleToolCall(reply, []);
      inboxItemToolCallRepository.update.mockResolvedValueOnce({
        affected: 0,
      });

      await expect(
        service.runOne({ ...actorArgs, inboxItemToolCallId: 'reply' }),
      ).rejects.toMatchObject({ code: InboxExceptionCode.INBOX_ITEM_CHANGED });

      expect(inboxToolCallExecutionService.execute).not.toHaveBeenCalled();
    });

    it('should refuse to run a call that already ran', async () => {
      const reply = buildToolCall({
        id: 'reply',
        status: InboxItemToolCallStatus.EXECUTED,
      });

      givenSingleToolCall(reply, []);

      await expect(
        service.runOne({ ...actorArgs, inboxItemToolCallId: 'reply' }),
      ).rejects.toMatchObject({ code: InboxExceptionCode.INBOX_ITEM_CHANGED });
    });

    it('should run a failed call again and drop its old error on the way in', async () => {
      const failedReply = buildToolCall({
        id: 'reply',
        status: InboxItemToolCallStatus.FAILED,
        error: 'No refresh token',
        resolvedAt: new Date(),
      });

      // The row is read failed before the claim, then proposed and holding
      // this run's claim once claimed
      inboxItemToolCallRepository.findOne.mockImplementation(async () => {
        const retryClaim = inboxItemToolCallRepository.update.mock.calls.find(
          ([, where]) => where.status === InboxItemToolCallStatus.FAILED,
        );

        return isDefined(retryClaim)
          ? {
              ...failedReply,
              status: InboxItemToolCallStatus.PROPOSED,
              error: null,
              resolvedAt: retryClaim[2].resolvedAt,
            }
          : failedReply;
      });
      inboxItemToolCallRepository.find.mockResolvedValueOnce([
        { ...failedReply, status: InboxItemToolCallStatus.EXECUTED },
      ]);

      await service.runOne({
        ...actorArgs,
        inboxItemToolCallId: 'reply',
      });

      expect(inboxItemToolCallRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: 'reply', status: InboxItemToolCallStatus.FAILED },
        expect.objectContaining({
          status: InboxItemToolCallStatus.PROPOSED,
          error: null,
          resolvedByUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
        }),
      );
      expect(inboxToolCallExecutionService.execute).toHaveBeenCalledTimes(1);
    });

    it('should refuse to run a plan that changed since it was read', async () => {
      givenSingleToolCall(buildToolCall({ id: 'reply' }), []);

      await expect(
        service.runOne({
          ...actorArgs,
          inboxItemToolCallId: 'reply',
          expectedVersion: 2,
        }),
      ).rejects.toMatchObject({ code: InboxExceptionCode.INBOX_ITEM_CHANGED });
    });
  });

  describe('create', () => {
    it('should append the call after the last one in the plan', async () => {
      inboxItemToolCallRepository.find.mockResolvedValueOnce([
        buildToolCall({ id: 'first', position: 0 }),
        buildToolCall({ id: 'second', position: 4 }),
      ]);
      inboxItemToolCallRepository.insertAndReturnOne.mockImplementation(
        async (
          _workspaceId: string,
          toolCall: Partial<InboxItemToolCallEntity>,
        ) => ({ id: 'created', ...toolCall }) as InboxItemToolCallEntity,
      );

      const created = await service.create({
        ...actorArgs,
        inboxItemId: INBOX_ITEM_ID,
        draft: {
          toolName: 'send_email',
          label: 'Reply',
          proposedInput: { recipients: { to: 'priya@northwind.com' } },
        },
      });

      expect(
        inboxItemToolCallRepository.insertAndReturnOne,
      ).toHaveBeenCalledWith(WORKSPACE_ID, {
        inboxItemId: INBOX_ITEM_ID,
        position: 5,
        toolName: 'send_email',
        label: 'Reply',
        description: null,
        icon: null,
        inputSchema: [],
        proposedInput: { recipients: { to: 'priya@northwind.com' } },
      });
      expect(created.id).toBe('created');
    });

    it('should lock the item before reading the plan it appends to', async () => {
      inboxItemToolCallRepository.find.mockResolvedValueOnce([]);
      inboxItemToolCallRepository.insertAndReturnOne.mockImplementation(
        async (
          _workspaceId: string,
          toolCall: Partial<InboxItemToolCallEntity>,
        ) => ({ id: 'created', ...toolCall }) as InboxItemToolCallEntity,
      );

      await service.create({
        ...actorArgs,
        inboxItemId: INBOX_ITEM_ID,
        draft: { toolName: 'send_email', label: 'Reply', proposedInput: {} },
      });

      expect(coreDataSource.transaction).toHaveBeenCalledTimes(1);
      expect(inboxItemRepository.findOne).toHaveBeenCalledWith(WORKSPACE_ID, {
        where: {
          id: INBOX_ITEM_ID,
          assigneeUserWorkspaceId: actorArgs.actorUserWorkspaceId,
        },
        lock: { mode: 'pessimistic_write' },
      });
      expect(
        inboxItemRepository.findOne.mock.invocationCallOrder[0],
      ).toBeLessThan(
        inboxItemToolCallRepository.find.mock.invocationCallOrder[0],
      );
    });

    // The visibility check and the lock are two reads; an item handed over or
    // moved between them must not take a step from its previous holder
    it('should refuse to add a call to an item that changed hands before the lock', async () => {
      inboxItemRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.create({
          ...actorArgs,
          inboxItemId: INBOX_ITEM_ID,
          draft: { toolName: 'send_email', label: 'Reply', proposedInput: {} },
        }),
      ).rejects.toMatchObject({
        code: InboxExceptionCode.INBOX_ITEM_CHANGED,
      });

      expect(
        inboxItemToolCallRepository.insertAndReturnOne,
      ).not.toHaveBeenCalled();
    });

    it('should refuse to add a call to an item the actor cannot see', async () => {
      inboxItemService.findVisibleItemOrThrow.mockRejectedValueOnce(
        new InboxException(
          'Inbox item not found',
          InboxExceptionCode.INBOX_ITEM_NOT_FOUND,
        ),
      );

      await expect(
        service.create({
          ...actorArgs,
          inboxItemId: INBOX_ITEM_ID,
          draft: { toolName: 'send_email', label: 'Reply', proposedInput: {} },
        }),
      ).rejects.toMatchObject({
        code: InboxExceptionCode.INBOX_ITEM_NOT_FOUND,
      });

      expect(
        inboxItemToolCallRepository.insertAndReturnOne,
      ).not.toHaveBeenCalled();
    });
  });

  describe('updateInput', () => {
    it('should let a failed call be edited before it is run again', async () => {
      inboxItemToolCallRepository.findOne.mockResolvedValue(
        buildToolCall({
          status: InboxItemToolCallStatus.FAILED,
          error: 'Invalid email addresses',
          resolvedAt: new Date(),
        }),
      );

      const toolCall = await service.updateInput({
        ...actorArgs,
        inboxItemToolCallId: 'tool-call-id',
        editedInput: { to: 'marie@example.com' },
      });

      expect(toolCall.editedInput).toEqual({ to: 'marie@example.com' });
      expect(inboxItemToolCallRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: 'tool-call-id', status: InboxItemToolCallStatus.FAILED },
        { editedInput: { to: 'marie@example.com' } },
      );
    });

    // A missing step is not a missing item: the client keeps the item and
    // only drops the row
    it('should refuse to edit a step that no longer exists', async () => {
      inboxItemToolCallRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateInput({
          ...actorArgs,
          inboxItemToolCallId: 'tool-call-id',
          editedInput: {},
        }),
      ).rejects.toMatchObject({
        code: InboxExceptionCode.INBOX_ITEM_TOOL_CALL_NOT_FOUND,
      });
      expect(inboxItemToolCallRepository.update).not.toHaveBeenCalled();
    });

    it('should refuse to edit a call that went through', async () => {
      inboxItemToolCallRepository.findOne.mockResolvedValue(
        buildToolCall({ status: InboxItemToolCallStatus.EXECUTED }),
      );

      await expect(
        service.updateInput({
          ...actorArgs,
          inboxItemToolCallId: 'tool-call-id',
          editedInput: {},
        }),
      ).rejects.toMatchObject({
        code: InboxExceptionCode.INBOX_ITEM_CHANGED,
      });
      expect(inboxItemToolCallRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('setRejected', () => {
    it('should let a failed step be skipped', async () => {
      inboxItemToolCallRepository.findOne.mockResolvedValue(
        buildToolCall({
          status: InboxItemToolCallStatus.FAILED,
          resolvedAt: new Date(),
        }),
      );

      const toolCall = await service.setRejected({
        ...actorArgs,
        inboxItemToolCallId: 'tool-call-id',
        isRejected: true,
      });

      expect(toolCall.status).toBe(InboxItemToolCallStatus.REJECTED);
    });

    it('should refuse to skip a step that is running', async () => {
      inboxItemToolCallRepository.findOne.mockResolvedValue(
        buildToolCall({ resolvedAt: new Date() }),
      );

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

    // A claim left behind by a run that died is not a running call
    it('should let a step with a stale claim be skipped', async () => {
      inboxItemToolCallRepository.findOne.mockResolvedValue(
        buildToolCall({
          resolvedAt: new Date(Date.now() - 2 * TOOL_CALL_CLAIM_TIMEOUT_MS),
        }),
      );

      const toolCall = await service.setRejected({
        ...actorArgs,
        inboxItemToolCallId: 'tool-call-id',
        isRejected: true,
      });

      expect(toolCall.status).toBe(InboxItemToolCallStatus.REJECTED);
    });

    it('should refuse to skip a step that already ran', async () => {
      inboxItemToolCallRepository.findOne.mockResolvedValue(
        buildToolCall({ status: InboxItemToolCallStatus.EXECUTED }),
      );

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
      inboxItemToolCallRepository.findOne.mockResolvedValue(buildToolCall({}));
      inboxItemToolCallRepository.update.mockResolvedValue({ affected: 0 });

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
        expect.objectContaining({
          id: 'tool-call-id',
          status: InboxItemToolCallStatus.PROPOSED,
        }),
        expect.anything(),
      );
    });
  });
});
