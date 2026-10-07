import { IsNull } from 'typeorm';

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
  };

  const sendArguments = {
    workspaceMemberId: 'member',
    userWorkspaceId: 'user-workspace-id',
    workspace,
    text: 'hello',
    browsingContext: null,
  };

  const buildService = ({
    thread = idleThread,
    claimAffected = 1,
    queuedMessages = [] as unknown[],
    heartbeatAlive = true,
    pendingToolOutput = { result: { questions: QUESTIONS, status: 'pending' } },
  }: {
    thread?: typeof idleThread & {
      pendingQuestionMessageId?: string;
    };
    pendingToolOutput?: Record<string, unknown>;
    claimAffected?: number;
    queuedMessages?: unknown[];
    heartbeatAlive?: boolean;
  } = {}) => {
    const publishedEvents: Array<{ type: string }> = [];
    const releaseQuery = jest.fn(async (_sql: string, _parameters: unknown[]) =>
      Array.from({ length: claimAffected }, () => ({ id: 'thread-id' })),
    );
    const claimReleases = () =>
      releaseQuery.mock.calls.map(([, parameters]) => {
        const [threadId, streamId, , turnError] = parameters as [
          string,
          string,
          string | null,
          string | null,
        ];

        return {
          threadId,
          streamId,
          turnError: turnError === null ? null : JSON.parse(turnError),
        };
      });
    const threadRepository = {
      findOne: jest.fn().mockResolvedValue(thread),
      findOneOrFail: jest.fn().mockResolvedValue(thread),
      update: jest.fn().mockResolvedValue({ affected: claimAffected }),
      query: jest.fn().mockImplementation(async (_workspaceId, work) =>
        work({
          table: (name: string) => name,
          manager: { query: releaseQuery },
        }),
      ),
    };
    const messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };
    const agentChatService = {
      addMessage: jest
        .fn()
        .mockResolvedValue({ id: 'user-message-id', turnId: 'turn-id' }),
      closePendingToolCalls: jest.fn().mockResolvedValue(undefined),
      getMessagesForThread: jest.fn().mockResolvedValue([]),
      getThreadContexts: jest.fn().mockResolvedValue([]),
      getQueuedMessages: jest.fn().mockResolvedValue(queuedMessages),
      hasQueuedMessages: jest
        .fn()
        .mockImplementation(() => Promise.resolve(queuedMessages.length > 0)),
      queueMessage: jest.fn().mockResolvedValue({ id: 'queued-message-id' }),
      promoteQueuedMessage: jest.fn().mockResolvedValue('turn-id'),
      deleteQueuedMessage: jest.fn().mockResolvedValue(true),
    };
    const messagePartRepository = {
      find: jest.fn().mockResolvedValue([
        {
          id: 'part-id',
          toolOutput: pendingToolOutput,
        },
      ]),
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
    const streamRecoveryService = new AgentChatStreamRecoveryService(
      threadRepository as never,
      streamHeartbeatService as never,
      eventPublisherService as never,
      metricsService as never,
    );

    const service = new AgentChatStreamingService(
      threadRepository as never,
      { find: jest.fn().mockResolvedValue([]) } as never,
      messageQueueService as never,
      agentChatService as never,
      {
        notifyThreadActivityUpdated: jest.fn().mockResolvedValue(undefined),
      } as never,
      eventPublisherService as never,
      { signFileByIdUrl: jest.fn() } as never,
      streamHeartbeatService as never,
      metricsService as never,
      streamRecoveryService,
      {
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
      messagePartRepository as never,
      {
        findLatestTurn: jest.fn().mockResolvedValue(null),
        markRunning: jest.fn().mockResolvedValue(true),
      } as never,
      {
        assertConversationNotSuspended: jest.fn().mockResolvedValue(undefined),
      } as never,
      { withThreadLockForMessage: jest.fn(({ work }) => work()) } as never,
      {
        findIncludedChatModel: jest.fn().mockResolvedValue(null),
      } as never,
    );

    return {
      service,
      streamRecoveryService,
      claimReleases,
      send: (overrides: { userWorkspaceId?: string } = {}) =>
        service.streamAgentChat({
          ...sendArguments,
          thread: thread as never,
          ...overrides,
        }),
      messagePartRepository,
      threadRepository,
      messageQueueService,
      agentChatService,
      eventPublisherService,
      streamHeartbeatService,
      publishedEvents,
    };
  };

  describe('streamAgentChat', () => {
    it('announces the participant prompt to the thread before enqueuing the reply', async () => {
      const {
        send,
        agentChatService,
        eventPublisherService,
        messageQueueService,
      } = buildService();
      await send({ userWorkspaceId: 'other-participant' });
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
      const { send, threadRepository, streamHeartbeatService } = buildService();

      const result = await send();

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
        { activeStreamId: expect.any(String) },
      );
      expect(streamHeartbeatService.markClaimed).toHaveBeenCalled();
      expect(
        streamHeartbeatService.markClaimed.mock.invocationCallOrder[0],
      ).toBeLessThan(threadRepository.update.mock.invocationCallOrder[0]);
    });

    it('queues the message when another stream wins the claim race', async () => {
      const {
        send,
        agentChatService,
        messageQueueService,
        streamHeartbeatService,
      } = buildService({
        claimAffected: 0,
      });

      const result = await send();

      expect(result.queued).toBe(true);
      expect(agentChatService.queueMessage).toHaveBeenCalled();
      expect(messageQueueService.add).not.toHaveBeenCalled();
      expect(streamHeartbeatService.clear).toHaveBeenCalled();
    });

    it('queues behind a halted backlog and kicks the drain from the front', async () => {
      const { send, agentChatService } = buildService({
        queuedMessages: [
          {
            id: 'older-queued-id',
            parts: [{ type: 'text', textContent: 'first in line' }],
          },
        ],
      });

      const result = await send();

      expect(result.queued).toBe(true);
      expect(agentChatService.queueMessage).toHaveBeenCalled();
      expect(agentChatService.promoteQueuedMessage).toHaveBeenCalledWith(
        expect.objectContaining({ messageId: 'older-queued-id' }),
      );
    });

    const waitingThread = {
      ...idleThread,
      pendingQuestionMessageId: 'question-message-id',
    };

    it('closes the pending call as skipped before streaming, unless an answer holds the stream', async () => {
      const { send, agentChatService, messageQueueService } = buildService({
        thread: waitingThread,
      });

      const result = await send();

      expect(result.queued).toBe(false);
      expect(agentChatService.closePendingToolCalls).toHaveBeenCalledWith({
        threadId: 'thread-id',
        messageId: 'question-message-id',
        workspaceId: 'workspace-id',
        where: { activeStreamId: IsNull() },
      });
      expect(
        agentChatService.closePendingToolCalls.mock.invocationCallOrder[0],
      ).toBeLessThan(messageQueueService.add.mock.invocationCallOrder[0]);
    });

    it('refuses a message while a caller waits on the pending call', async () => {
      const { send, agentChatService, messageQueueService } = buildService({
        thread: waitingThread,
        pendingToolOutput: {
          result: { questions: QUESTIONS, status: 'pending' },
          awaitedByCaller: true,
        },
      });

      await expect(send()).rejects.toMatchObject({
        code: AiExceptionCode.THREAD_AWAITING_ANSWER,
      });
      expect(agentChatService.closePendingToolCalls).not.toHaveBeenCalled();
      expect(agentChatService.addMessage).not.toHaveBeenCalled();
      expect(agentChatService.queueMessage).not.toHaveBeenCalled();
      expect(messageQueueService.add).not.toHaveBeenCalled();
    });

    it('releases the claim when enqueueing the job fails', async () => {
      const {
        send,
        claimReleases,
        messageQueueService,
        streamHeartbeatService,
      } = buildService();

      messageQueueService.add.mockRejectedValue(new Error('redis down'));

      await expect(send()).rejects.toThrow('redis down');

      expect(claimReleases()).toEqual([
        {
          threadId: 'thread-id',
          streamId: expect.any(String),
          turnError: expect.objectContaining({ message: 'redis down' }),
        },
      ]);
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

    it('keeps queued messages waiting behind a pending call', async () => {
      const { service, agentChatService, messageQueueService } = buildService({
        queuedMessages,
        thread: {
          ...idleThread,
          pendingQuestionMessageId: 'question-message-id',
        },
      });

      await service.flushNextQueuedMessage({
        threadId: 'thread-id',
        workspace,
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
        workspace,
      });

      expect(agentChatService.promoteQueuedMessage).toHaveBeenCalledWith(
        expect.objectContaining({ messageId: 'queued-message-id' }),
      );
      expect(messageQueueService.add).toHaveBeenCalled();
    });
  });

  describe('reapDeadStream', () => {
    it('leaves a live stream alone', async () => {
      const { streamRecoveryService, threadRepository } = buildService();

      const reaped = await streamRecoveryService.reapDeadStream({
        thread: { id: 'thread-id', activeStreamId: 'stream-id' },
        workspaceId: 'workspace-id',
      });

      expect(reaped).toBeNull();
      expect(threadRepository.update).not.toHaveBeenCalled();
    });

    it('converts a heartbeat-less claim into a retryable interrupted error', async () => {
      const {
        streamRecoveryService,
        claimReleases,
        eventPublisherService,
        publishedEvents,
      } = buildService({ heartbeatAlive: false });

      const reaped = await streamRecoveryService.reapDeadStream({
        thread: { id: 'thread-id', activeStreamId: 'stream-id' },
        workspaceId: 'workspace-id',
      });

      expect(reaped).toEqual(
        expect.objectContaining({ code: AiExceptionCode.STREAM_INTERRUPTED }),
      );
      expect(claimReleases()).toEqual([
        {
          threadId: 'thread-id',
          streamId: 'stream-id',
          turnError: expect.objectContaining({
            code: AiExceptionCode.STREAM_INTERRUPTED,
          }),
        },
      ]);
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
      const { streamRecoveryService, publishedEvents, claimReleases } =
        buildService({
          heartbeatAlive: false,
          claimAffected: 0,
        });

      const reaped = await streamRecoveryService.reapDeadStream({
        thread: { id: 'thread-id', activeStreamId: 'stream-id' },
        workspaceId: 'workspace-id',
      });

      expect(reaped).toBeNull();
      expect(claimReleases()).toHaveLength(1);
      expect(publishedEvents).toHaveLength(0);
    });
  });
});
