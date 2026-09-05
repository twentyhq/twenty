import { Test, type TestingModule } from '@nestjs/testing';

import { isDefined } from 'twenty-shared/utils';

import { InboxItemToolCallEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-tool-call.entity';
import { InboxItemOutcome } from 'src/engine/core-modules/inbox/enums/inbox-item-outcome.enum';
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

      const inboxItem = await service.runAll({
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
          transition: { kind: 'CLEAR', outcome: 'DONE' },
        }),
      );
      expect(inboxItem).toMatchObject({ outcome: 'DONE' });
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
              type: 'NUMBER',
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
          transition: { kind: 'CLEAR', outcome: InboxItemOutcome.DONE },
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

    // A skipped step is the person's veto, and the outcome should say so
    it('should clear the item as partial when a step was skipped', async () => {
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
          transition: { kind: 'CLEAR', outcome: 'PARTIAL' },
        }),
      );
    });

    it('should clear the item as partial when every step was skipped', async () => {
      const first = buildToolCall({
        id: 'first',
        status: InboxItemToolCallStatus.REJECTED,
      });

      givenToolCalls([first], [first]);

      await service.runAll({ ...actorArgs, inboxItemId: INBOX_ITEM_ID });

      expect(inboxToolCallExecutionService.execute).not.toHaveBeenCalled();
      expect(inboxTransitionService.transition).toHaveBeenCalledWith(
        expect.objectContaining({
          transition: { kind: 'CLEAR', outcome: 'PARTIAL' },
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
            { key: 'to', label: 'To', type: 'TEXT', isRequired: true },
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
              type: 'NUMBER',
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

  describe('setRejected', () => {
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
