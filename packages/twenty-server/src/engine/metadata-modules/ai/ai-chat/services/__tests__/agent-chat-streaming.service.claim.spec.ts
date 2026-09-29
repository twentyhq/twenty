import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';

const QUESTIONS = [
  {
    header: 'Plan',
    question: 'Which plan?',
    options: [{ label: 'Pro' }, { label: 'Team' }],
  },
];

describe('AgentChatStreamingService claim & reap', () => {
  const workspace = { id: 'workspace-id' } as WorkspaceEntity;

  const idleThread = {
    id: 'thread-id',
    title: 'Thread',
    conversationSize: 0,
    activeStreamId: null,
    lastStreamError: null,
  };

  const buildService = ({
    thread = idleThread,
    claimAffected = 1,
    queuedMessages = [] as unknown[],
    heartbeatAlive = true,
    pendingInputAsk = null as {
      id: string;
      toolCallId: string;
      workflowRunId: string | null;
    } | null,
  } = {}) => {
    const publishedEvents: Array<{ type: string }> = [];
    const threadRepository = {
      findOne: jest.fn().mockResolvedValue(thread),
      findOneOrFail: jest.fn().mockResolvedValue(thread),
      update: jest.fn().mockResolvedValue({ affected: claimAffected }),
    };
    const messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };
    const agentChatService = {
      getWritableThread: jest
        .fn()
        .mockImplementation(() => threadRepository.findOne()),
      addMessage: jest
        .fn()
        .mockResolvedValue({ id: 'user-message-id', turnId: 'turn-id' }),
      notifyThreadActivityUpdated: jest.fn().mockResolvedValue(undefined),
      getMessagesForThread: jest.fn().mockResolvedValue([]),
      getQueuedMessages: jest.fn().mockResolvedValue(queuedMessages),
      hasQueuedMessages: jest
        .fn()
        .mockImplementation(() => Promise.resolve(queuedMessages.length > 0)),
      queueMessage: jest.fn().mockResolvedValue({ id: 'queued-message-id' }),
      promoteQueuedMessage: jest.fn().mockResolvedValue('turn-id'),
      deleteQueuedMessage: jest.fn().mockResolvedValue(true),
      findToolPart: jest.fn().mockResolvedValue({
        id: 'part-id',
        messageId: 'question-message-id',
        turnId: 'question-turn-id',
        toolName: 'ask_questions',
        toolInput: { questions: QUESTIONS },
        toolOutput: { result: { questions: QUESTIONS, status: 'pending' } },
      }),
      updateToolPartOutput: jest.fn().mockResolvedValue(undefined),
    };
    const inputAskWorkspaceService = {
      findPendingForThread: jest.fn().mockResolvedValue(pendingInputAsk),
      cancel: jest.fn().mockResolvedValue(true),
    };
    const eventPublisherService = {
      publish: jest.fn().mockImplementation(({ event }) => {
        publishedEvents.push(event);

        return Promise.resolve();
      }),
      resetStreamState: jest.fn().mockResolvedValue(undefined),
    };
    const streamHeartbeatService = {
      markClaimed: jest.fn().mockResolvedValue(undefined),
      isAlive: jest.fn().mockResolvedValue(heartbeatAlive),
      clear: jest.fn().mockResolvedValue(undefined),
    };

    const metricsService = { incrementCounterBy: jest.fn() };

    const service = new AgentChatStreamingService(
      threadRepository as never,
      { find: jest.fn().mockResolvedValue([]) } as never,
      messageQueueService as never,
      agentChatService as never,
      eventPublisherService as never,
      { signFileByIdUrl: jest.fn() } as never,
      streamHeartbeatService as never,
      metricsService as never,
      new AgentChatStreamRecoveryService(
        threadRepository as never,
        streamHeartbeatService as never,
        eventPublisherService as never,
        metricsService as never,
      ),
      {
        authorizeJob: jest.fn().mockResolvedValue(undefined),
        authorizeRetry: jest.fn().mockResolvedValue(undefined),
        authorize: jest
          .fn()
          .mockResolvedValue({ authContext: { workspaceMemberId: 'member' } }),
        resolveMessage: jest.fn().mockResolvedValue({
          sender: {
            userWorkspaceId: 'user-workspace-id',
            applicationId: null,
          },
        }),
      } as never,
      inputAskWorkspaceService as never,
    );

    return {
      service,
      inputAskWorkspaceService,
      threadRepository,
      messageQueueService,
      agentChatService,
      eventPublisherService,
      streamHeartbeatService,
      publishedEvents,
    };
  };

  const sendArguments = {
    workspaceMemberId: 'member',
    threadId: 'thread-id',
    userWorkspaceId: 'user-workspace-id',
    workspace,
    text: 'hello',
    browsingContext: null,
  };

  describe('streamAgentChat', () => {
    it('announces the participant prompt to the thread before enqueuing the reply', async () => {
      const {
        service,
        agentChatService,
        eventPublisherService,
        messageQueueService,
      } = buildService();
      await service.streamAgentChat({
        ...sendArguments,
        userWorkspaceId: 'other-participant',
      });
      expect(agentChatService.addMessage).toHaveBeenCalledWith(
        expect.objectContaining({ userWorkspaceId: 'other-participant' }),
      );
      expect(eventPublisherService.publish).toHaveBeenCalledWith({
        workspaceId: workspace.id,
        threadId: 'thread-id',
        event: { type: 'message-persisted', messageId: 'user-message-id' },
      });
      expect(
        eventPublisherService.publish.mock.invocationCallOrder[0],
      ).toBeLessThan(messageQueueService.add.mock.invocationCallOrder[0]);
    });

    it('claims the thread conditionally before enqueueing', async () => {
      const { service, threadRepository, streamHeartbeatService } =
        buildService();

      const result = await service.streamAgentChat(sendArguments);

      expect(result.queued).toBe(false);
      expect(result).toEqual(
        expect.objectContaining({
          messageId: 'user-message-id',
          turnId: 'turn-id',
        }),
      );
      expect(threadRepository.update).toHaveBeenCalledWith(
        'workspace-id',
        expect.objectContaining({ id: 'thread-id' }),
        expect.objectContaining({ lastStreamError: null }),
      );
      expect(streamHeartbeatService.markClaimed).toHaveBeenCalled();
      expect(
        streamHeartbeatService.markClaimed.mock.invocationCallOrder[0],
      ).toBeLessThan(threadRepository.update.mock.invocationCallOrder[0]);
    });

    it('queues the message when another stream wins the claim race', async () => {
      const {
        service,
        agentChatService,
        messageQueueService,
        streamHeartbeatService,
      } = buildService({
        claimAffected: 0,
      });

      const result = await service.streamAgentChat(sendArguments);

      expect(result.queued).toBe(true);
      expect(agentChatService.queueMessage).toHaveBeenCalled();
      expect(messageQueueService.add).not.toHaveBeenCalled();
      expect(streamHeartbeatService.clear).toHaveBeenCalled();
    });

    it('queues behind a halted backlog and kicks the drain from the front', async () => {
      const { service, agentChatService } = buildService({
        queuedMessages: [
          {
            id: 'older-queued-id',
            parts: [{ type: 'text', textContent: 'first in line' }],
          },
        ],
      });

      const result = await service.streamAgentChat(sendArguments);

      expect(result.queued).toBe(true);
      expect(agentChatService.queueMessage).toHaveBeenCalled();
      expect(agentChatService.promoteQueuedMessage).toHaveBeenCalledWith(
        expect.objectContaining({ messageId: 'older-queued-id' }),
      );
    });

    it('loads hidden messages for the model', async () => {
      const { service, agentChatService } = buildService();

      await service.streamAgentChat(sendArguments);

      expect(agentChatService.getMessagesForThread).toHaveBeenCalledWith(
        expect.objectContaining({ includeHidden: true }),
      );
    });

    it('cancels a pending chat Ask and closes its call as skipped before streaming', async () => {
      const {
        service,
        inputAskWorkspaceService,
        agentChatService,
        messageQueueService,
      } = buildService({
        pendingInputAsk: {
          id: 'input-ask-id',
          toolCallId: 'tool-call-id',
          workflowRunId: null,
        },
      });

      const result = await service.streamAgentChat(sendArguments);

      expect(result.queued).toBe(false);
      expect(inputAskWorkspaceService.cancel).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        match: { threadId: 'thread-id', toolCallId: 'tool-call-id' },
      });
      expect(agentChatService.updateToolPartOutput).toHaveBeenCalledWith({
        partId: 'part-id',
        workspaceId: 'workspace-id',
        toolOutput: expect.objectContaining({
          result: { questions: QUESTIONS, status: 'skipped' },
        }),
      });
      expect(
        agentChatService.updateToolPartOutput.mock.invocationCallOrder[0],
      ).toBeLessThan(messageQueueService.add.mock.invocationCallOrder[0]);
    });

    it('leaves the call as it is when another request already closed the Ask', async () => {
      const { service, inputAskWorkspaceService, agentChatService } =
        buildService({
          pendingInputAsk: {
            id: 'input-ask-id',
            toolCallId: 'tool-call-id',
            workflowRunId: null,
          },
        });

      inputAskWorkspaceService.cancel.mockResolvedValue(false);

      await service.streamAgentChat(sendArguments);

      expect(agentChatService.updateToolPartOutput).not.toHaveBeenCalled();
    });

    it("refuses a message while the run's Ask is pending, without canceling it", async () => {
      const {
        service,
        inputAskWorkspaceService,
        agentChatService,
        messageQueueService,
      } = buildService({
        pendingInputAsk: {
          id: 'input-ask-id',
          toolCallId: 'tool-call-id',
          workflowRunId: 'workflow-run-id',
        },
      });

      await expect(service.streamAgentChat(sendArguments)).rejects.toMatchObject(
        { code: AiExceptionCode.THREAD_AWAITING_WORKFLOW_INPUT },
      );
      expect(inputAskWorkspaceService.cancel).not.toHaveBeenCalled();
      expect(agentChatService.addMessage).not.toHaveBeenCalled();
      expect(agentChatService.queueMessage).not.toHaveBeenCalled();
      expect(messageQueueService.add).not.toHaveBeenCalled();
    });

    it('releases the claim when enqueueing the job fails', async () => {
      const {
        service,
        threadRepository,
        messageQueueService,
        streamHeartbeatService,
      } = buildService();

      messageQueueService.add.mockRejectedValue(new Error('redis down'));

      await expect(service.streamAgentChat(sendArguments)).rejects.toThrow(
        'redis down',
      );

      expect(threadRepository.update).toHaveBeenLastCalledWith(
        'workspace-id',
        { id: 'thread-id', activeStreamId: expect.any(String) },
        { activeStreamId: null },
      );
      expect(streamHeartbeatService.clear).toHaveBeenCalled();
    });
  });

  describe('flushNextQueuedMessage', () => {
    const queuedMessages = [
      {
        id: 'queued-message-id',
        parts: [{ type: 'text', textContent: 'next' }],
      },
    ];

    it('keeps queued messages waiting behind a pending Ask', async () => {
      const { service, agentChatService, messageQueueService } = buildService({
        queuedMessages,
        pendingInputAsk: {
          id: 'input-ask-id',
          toolCallId: 'tool-call-id',
          workflowRunId: null,
        },
      });

      await service.flushNextQueuedMessage({
        threadId: 'thread-id',
        workspaceId: 'workspace-id',
        hasTitle: true,
      });

      expect(agentChatService.promoteQueuedMessage).not.toHaveBeenCalled();
      expect(messageQueueService.add).not.toHaveBeenCalled();
    });

    it('promotes the next queued message once nothing is pending', async () => {
      const { service, agentChatService, messageQueueService } = buildService({
        queuedMessages,
      });

      await service.flushNextQueuedMessage({
        threadId: 'thread-id',
        workspaceId: 'workspace-id',
        hasTitle: true,
      });

      expect(agentChatService.promoteQueuedMessage).toHaveBeenCalledWith(
        expect.objectContaining({ messageId: 'queued-message-id' }),
      );
      expect(messageQueueService.add).toHaveBeenCalled();
    });
  });

  describe('reapDeadStream', () => {
    it('leaves a live stream alone', async () => {
      const { service, threadRepository } = buildService();

      const reaped = await service.reapDeadStream({
        thread: { id: 'thread-id', activeStreamId: 'stream-id' },
        workspaceId: 'workspace-id',
      });

      expect(reaped).toBeNull();
      expect(threadRepository.update).not.toHaveBeenCalled();
    });

    it('converts a heartbeat-less claim into a retryable interrupted error', async () => {
      const {
        service,
        threadRepository,
        eventPublisherService,
        publishedEvents,
      } = buildService({ heartbeatAlive: false });

      const reaped = await service.reapDeadStream({
        thread: { id: 'thread-id', activeStreamId: 'stream-id' },
        workspaceId: 'workspace-id',
      });

      expect(reaped).toEqual(
        expect.objectContaining({ code: AiExceptionCode.STREAM_INTERRUPTED }),
      );
      expect(threadRepository.update).toHaveBeenCalledWith(
        'workspace-id',
        { id: 'thread-id', activeStreamId: 'stream-id' },
        expect.objectContaining({
          activeStreamId: null,
          lastStreamError: expect.objectContaining({
            code: AiExceptionCode.STREAM_INTERRUPTED,
          }),
        }),
      );
      expect(eventPublisherService.resetStreamState).toHaveBeenCalledWith(
        'thread-id',
      );
      expect(publishedEvents).toContainEqual(
        expect.objectContaining({
          type: 'stream-error',
          code: AiExceptionCode.STREAM_INTERRUPTED,
        }),
      );
    });

    it('does nothing when the claim moved to a newer stream mid-check', async () => {
      const { service, publishedEvents, threadRepository } = buildService({
        heartbeatAlive: false,
        claimAffected: 0,
      });

      const reaped = await service.reapDeadStream({
        thread: { id: 'thread-id', activeStreamId: 'stream-id' },
        workspaceId: 'workspace-id',
      });

      expect(reaped).toBeNull();
      expect(threadRepository.update).toHaveBeenCalledTimes(1);
      expect(publishedEvents).toHaveLength(0);
    });
  });
});
