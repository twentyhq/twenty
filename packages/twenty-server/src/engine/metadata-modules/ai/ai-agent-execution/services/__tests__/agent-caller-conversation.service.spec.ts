import { IsNull } from 'typeorm';

import { AgentCallerConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-caller-conversation.service';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

const SENDER = {
  type: 'workflow' as const,
  workflowId: 'workflow-id',
  workflowName: 'New deals',
};

const OPEN_ARGS = {
  workspaceId: 'workspace-id',
  sender: SENDER,
  title: 'Draft the quote',
  threadKey: 'run-id:step-id',
  fallbackThreadKey: 'run-id:step-id:run-id:step-id',
};

const CALLER = {
  type: 'WORKFLOW_STEP' as const,
  ref: { workflowRunId: 'run-id', stepId: 'step-id' },
};

const QUESTION = {
  header: 'Plan',
  question: 'Which plan?',
  options: [{ label: 'Pro' }, { label: 'Team' }],
};

const buildService = ({ isCreated = true } = {}) => {
  const threadRepository = {
    find: jest
      .fn()
      .mockResolvedValue([
        { id: 'thread-id', pendingQuestionMessageId: 'message-id' },
      ]),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  const messageRepository = { find: jest.fn().mockResolvedValue([]) };
  const messagePartRepository = {
    find: jest.fn().mockResolvedValue([
      {
        id: 'part-id',
        messageId: 'message-id',
        toolName: 'ask_question',
        toolInput: QUESTION,
        toolOutput: {
          result: { question: QUESTION, status: 'pending' },
          workflowStep: { workflowRunId: 'run-id', stepId: 'step-id' },
        },
      },
    ]),
    update: jest.fn(),
    writePart: jest.fn(),
    query: jest.fn(),
  };

  messagePartRepository.query.mockImplementation(async (_workspaceId, run) =>
    run({
      table: (name: string) => name,
      manager: { query: messagePartRepository.writePart },
    }),
  );

  const agentInboxService = {
    openThread: jest.fn().mockImplementation(({ workspaceMemberId }) =>
      Promise.resolve({
        thread: { id: `thread-for-${workspaceMemberId ?? 'nobody'}` },
        isCreated,
      }),
    ),
  };
  const threadRecordEventService = {
    emitPendingQuestionCleared: jest.fn().mockResolvedValue(undefined),
  };
  const turnRecorderService = {
    endWaitingTurn: jest.fn().mockResolvedValue(undefined),
  };

  const service = new AgentCallerConversationService(
    threadRepository as never,
    messageRepository as never,
    messagePartRepository as never,
    agentInboxService as never,
    threadRecordEventService as never,
    turnRecorderService as never,
  );

  return {
    service,
    threadRepository,
    messageRepository,
    messagePartRepository,
    agentInboxService,
    threadRecordEventService,
    turnRecorderService,
  };
};

describe('AgentCallerConversationService', () => {
  describe('openConversation', () => {
    it('opens the conversation with the recipient, filed under done', async () => {
      const { service, agentInboxService } = buildService();

      const conversation = await service.openConversation({
        ...OPEN_ARGS,
        recipientWorkspaceMemberId: 'recipient-id',
        fallbackRecipientWorkspaceMemberId: 'creator-id',
      });

      expect(conversation).toEqual({
        status: 'OPENED',
        threadId: 'thread-for-recipient-id',
        isCreated: true,
      });
      expect(agentInboxService.openThread).toHaveBeenCalledTimes(1);
      expect(agentInboxService.openThread).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        sender: SENDER,
        workspaceMemberId: 'recipient-id',
        threadKey: 'run-id:step-id',
        title: 'Draft the quote',
        isArchivedOnCreate: true,
      });
    });

    it('falls back to the fallback recipient without a recipient', async () => {
      const { service } = buildService();

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: null,
          fallbackRecipientWorkspaceMemberId: 'creator-id',
        }),
      ).resolves.toMatchObject({ threadId: 'thread-for-creator-id' });
    });

    it('keeps a conversation no inbox receives when the fallback recipient cannot have it', async () => {
      const { service, agentInboxService } = buildService();

      agentInboxService.openThread.mockRejectedValueOnce(
        new AiException(
          'Thread owner is no longer a workspace member',
          AiExceptionCode.THREAD_NOT_FOUND,
        ),
      );

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: null,
          fallbackRecipientWorkspaceMemberId: 'creator-id',
        }),
      ).resolves.toMatchObject({ threadId: 'thread-for-nobody' });
    });

    it('keeps a conversation no inbox receives without any recipient', async () => {
      const { service } = buildService();

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: null,
        }),
      ).resolves.toMatchObject({ threadId: 'thread-for-nobody' });
    });

    it('fails when the recipient cannot have the conversation', async () => {
      const { service, agentInboxService } = buildService();

      agentInboxService.openThread.mockRejectedValueOnce(
        new AiException(
          'Thread owner is no longer a workspace member',
          AiExceptionCode.THREAD_NOT_FOUND,
        ),
      );

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: 'recipient-id',
        }),
      ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_NOT_FOUND });
    });

    it('starts its own conversation when the recipient deleted the one its key names', async () => {
      const { service, agentInboxService } = buildService();

      agentInboxService.openThread.mockResolvedValueOnce({
        thread: { id: 'deleted-thread-id', deletedAt: '2026-01-01' },
        isCreated: false,
      });

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: 'recipient-id',
        }),
      ).resolves.toEqual({
        status: 'OPENED',
        threadId: 'thread-for-recipient-id',
        isCreated: true,
      });
      expect(agentInboxService.openThread).toHaveBeenLastCalledWith(
        expect.objectContaining({ threadKey: 'run-id:step-id:run-id:step-id' }),
      );
    });

    it('starts its own conversation while the one its key names waits on another answer', async () => {
      const { service, agentInboxService } = buildService();

      agentInboxService.openThread.mockResolvedValueOnce({
        thread: {
          id: 'waiting-thread-id',
          pendingQuestionMessageId: 'question-message-id',
        },
        isCreated: false,
      });

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: 'recipient-id',
        }),
      ).resolves.toMatchObject({ threadId: 'thread-for-recipient-id' });
    });

    it('reports a conversation the recipient also deleted under the fallback key', async () => {
      const { service, agentInboxService } = buildService();

      agentInboxService.openThread.mockResolvedValue({
        thread: { id: 'deleted-thread-id', deletedAt: '2026-01-01' },
        isCreated: false,
      });

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: 'recipient-id',
        }),
      ).resolves.toEqual({ status: 'DELETED' });
    });
  });

  describe('recordWaitOutcome', () => {
    const waitPart = (id: string, workflowStep: Record<string, string>) => ({
      id,
      toolName: 'wait_for_duration',
      toolOutput: { result: { status: 'pending' }, workflowStep },
    });

    const recordWaitOutcome = (service: AgentCallerConversationService) =>
      service.recordWaitOutcome({
        workspaceId: 'workspace-id',
        threadId: 'thread-id',
        caller: CALLER,
        toolNames: ['wait_for_duration'],
        toolOutput: { success: true },
      });

    it("settles the caller's own wait, not another caller's waiting in the same conversation", async () => {
      const { service, messageRepository, messagePartRepository } =
        buildService();

      messageRepository.find.mockResolvedValue([
        {
          parts: [
            waitPart('other-run-part', {
              workflowRunId: 'other-run-id',
              stepId: 'step-id',
            }),
          ],
        },
        {
          parts: [
            waitPart('other-step-part', {
              workflowRunId: 'run-id',
              stepId: 'other-step-id',
            }),
          ],
        },
        {
          parts: [
            waitPart('own-part', {
              workflowRunId: 'run-id',
              stepId: 'step-id',
            }),
          ],
        },
      ]);

      await recordWaitOutcome(service);

      expect(messagePartRepository.update).toHaveBeenCalledWith(
        'workspace-id',
        { id: 'own-part' },
        { toolOutput: { success: true } },
      );
    });

    it('refuses to settle a wait the caller never posted', async () => {
      const { service, messageRepository } = buildService();

      messageRepository.find.mockResolvedValue([
        {
          parts: [
            waitPart('other-run-part', {
              workflowRunId: 'other-run-id',
              stepId: 'step-id',
            }),
          ],
        },
      ]);

      await expect(recordWaitOutcome(service)).rejects.toMatchObject({
        code: AiExceptionCode.TOOL_CALL_NOT_FOUND,
      });
    });
  });

  describe('cancelAwaitingConversations', () => {
    const cancel = (service: AgentCallerConversationService) =>
      service.cancelAwaitingConversations({
        workspaceId: 'workspace-id',
        threadIds: ['thread-id'],
        caller: { type: 'WORKFLOW_STEP', ref: { workflowRunId: 'run-id' } },
      });

    it('stops its conversations waiting and closes their calls as skipped', async () => {
      const {
        service,
        threadRepository,
        messagePartRepository,
        turnRecorderService,
      } = buildService();

      await cancel(service);

      expect(threadRepository.update).toHaveBeenCalledWith(
        'workspace-id',
        {
          id: 'thread-id',
          pendingQuestionMessageId: 'message-id',
          activeStreamId: IsNull(),
        },
        { pendingQuestionMessageId: null },
      );
      expect(turnRecorderService.endWaitingTurn).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        messageId: 'message-id',
        status: AgentTurnStatus.CANCELLED,
      });
      const [[closeQuery, [partId, closedToolOutput, expectedStatus]]] =
        messagePartRepository.writePart.mock.calls;

      expect(closeQuery).toContain(`"toolOutput"->'result'->>'status' = $3`);
      expect({
        partId,
        result: JSON.parse(closedToolOutput).result,
        expectedStatus,
      }).toEqual({
        partId: 'part-id',
        result: { question: QUESTION, status: 'skipped' },
        expectedStatus: 'pending',
      });
    });

    it('tells open chat lists the conversation no longer waits on an answer', async () => {
      const { service, threadRecordEventService } = buildService();

      await cancel(service);

      expect(
        threadRecordEventService.emitPendingQuestionCleared,
      ).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        threadId: 'thread-id',
        messageId: 'message-id',
      });
    });

    it('leaves open a call another caller posted in a conversation they share', async () => {
      const { service, threadRepository, messagePartRepository } =
        buildService();

      messagePartRepository.find.mockResolvedValue([
        {
          id: 'part-id',
          messageId: 'message-id',
          toolName: 'ask_question',
          toolInput: QUESTION,
          toolOutput: {
            result: { question: QUESTION, status: 'pending' },
            workflowStep: { workflowRunId: 'other-run-id', stepId: 'step-id' },
          },
        },
      ]);

      await cancel(service);

      expect(threadRepository.update).not.toHaveBeenCalled();
      expect(messagePartRepository.writePart).not.toHaveBeenCalled();
    });

    it('leaves a conversation to the answer holding its claim', async () => {
      const {
        service,
        threadRepository,
        messagePartRepository,
        threadRecordEventService,
      } = buildService();

      threadRepository.update.mockResolvedValue({ affected: 0 });

      await cancel(service);

      expect(messagePartRepository.writePart).not.toHaveBeenCalled();
      expect(
        threadRecordEventService.emitPendingQuestionCleared,
      ).not.toHaveBeenCalled();
    });

    it('reads nothing without conversations', async () => {
      const { service, threadRepository } = buildService();

      await service.cancelAwaitingConversations({
        workspaceId: 'workspace-id',
        threadIds: [],
        caller: { type: 'WORKFLOW_STEP', ref: { workflowRunId: 'run-id' } },
      });

      expect(threadRepository.find).not.toHaveBeenCalled();
    });
  });
});
