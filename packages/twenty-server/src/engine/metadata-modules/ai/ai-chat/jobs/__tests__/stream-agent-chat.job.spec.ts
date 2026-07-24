import { type UIMessageChunk } from 'ai';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { StreamAgentChatJob } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat.job';
import { type StreamAgentChatJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat-job.types';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

type PublishedEvent = { type: string } & Record<string, unknown>;

const TEXT_CHUNKS: UIMessageChunk[] = [
  { type: 'start', messageId: 'assistant-message-id' },
  { type: 'start-step' },
  { type: 'text-start', id: 'text-1' },
  { type: 'text-delta', id: 'text-1', delta: 'Hello' },
  { type: 'text-end', id: 'text-1' },
];

const RESPONSE_MESSAGE = {
  role: 'assistant' as const,
  parts: [{ type: 'text' as const, text: 'Hello' }],
};

const createFakeChatStream = ({
  chunks = TEXT_CHUNKS,
  responseMessage = RESPONSE_MESSAGE,
  midStreamError,
  onFirstChunk,
}: {
  chunks?: UIMessageChunk[];
  responseMessage?: typeof RESPONSE_MESSAGE;
  midStreamError?: Error;
  onFirstChunk?: () => void;
} = {}) => ({
  toUIMessageStream: (options: {
    onError?: (error: unknown) => string;
    onFinish?: (event: {
      responseMessage: typeof RESPONSE_MESSAGE;
      isAborted: boolean;
    }) => Promise<void> | void;
  }) =>
    new ReadableStream<UIMessageChunk>({
      async start(controller) {
        let isFirstChunk = true;

        for (const chunk of chunks) {
          controller.enqueue(chunk);

          if (isFirstChunk) {
            isFirstChunk = false;
            onFirstChunk?.();
          }
        }

        if (midStreamError) {
          const errorText = options.onError?.(midStreamError) ?? '';

          controller.enqueue({ type: 'error', errorText });
        }

        await options.onFinish?.({ responseMessage, isAborted: false });

        controller.close();
      },
    }),
});

describe('StreamAgentChatJob', () => {
  const workspace = { id: 'workspace-id' } as WorkspaceEntity;

  const jobData: StreamAgentChatJobData = {
    threadId: 'thread-id',
    streamId: 'stream-id',
    userWorkspaceId: 'user-workspace-id',
    workspaceId: 'workspace-id',
    messages: [],
    browsingContext: null,
    lastUserMessageText: 'hello',
    lastUserMessageParts: [{ type: 'text', text: 'hello' }],
    hasTitle: true,
    conversationSizeTokens: 0,
    existingTurnId: 'turn-id',
  };

  const buildJob = ({
    workspaceFound = true,
    chatStream = createFakeChatStream(),
    streamChatRejection,
    addMessageRejection,
    assistantPersistRejection,
    totalsUpdateAffected = 1,
  }: {
    workspaceFound?: boolean;
    chatStream?: ReturnType<typeof createFakeChatStream>;
    streamChatRejection?: Error;
    addMessageRejection?: Error;
    assistantPersistRejection?: Error;
    totalsUpdateAffected?: number;
  } = {}) => {
    const publishedEvents: PublishedEvent[] = [];

    const threadRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'thread-id',
        deletedAt: null,
        activeStreamId: 'stream-id',
      }),
      update: jest.fn().mockImplementation((_workspaceId, _criteria, values) =>
        Promise.resolve({
          affected:
            values && typeof values.totalInputTokens === 'function'
              ? totalsUpdateAffected
              : 1,
        }),
      ),
    };
    const workspaceRepository = {
      findOne: jest.fn().mockResolvedValue(workspaceFound ? workspace : null),
    };
    const agentChatService = {
      addMessage: addMessageRejection
        ? jest.fn().mockRejectedValue(addMessageRejection)
        : jest.fn().mockResolvedValue({ id: 'assistant-message-id' }),
      upsertAssistantMessage: assistantPersistRejection
        ? jest.fn().mockRejectedValue(assistantPersistRejection)
        : jest.fn().mockResolvedValue(undefined),
      generateTitleIfNeeded: jest.fn().mockResolvedValue(null),
      notifyThreadUsageUpdated: jest.fn().mockResolvedValue(undefined),
    };
    const chatExecutionService = {
      streamChat: streamChatRejection
        ? jest.fn().mockRejectedValue(streamChatRejection)
        : jest.fn().mockResolvedValue({
            stream: chatStream,
            modelConfig: { contextWindowTokens: 100000 },
            hasNoMoreAvailableCredits: () => false,
          }),
    };
    const eventPublisherService = {
      resetStreamState: jest.fn().mockResolvedValue(undefined),
      publish: jest
        .fn()
        .mockImplementation(({ event }: { event: PublishedEvent }) => {
          publishedEvents.push(event);

          return Promise.resolve();
        }),
    };
    const cancelCallbacks: Array<() => void> = [];
    const cancelSubscriberService = {
      subscribe: jest
        .fn()
        .mockImplementation((_channel: string, callback: () => void) => {
          cancelCallbacks.push(callback);

          return Promise.resolve();
        }),
      unsubscribe: jest.fn().mockResolvedValue(undefined),
    };
    const agentChatStreamingService = {
      flushNextQueuedMessage: jest.fn().mockResolvedValue(undefined),
    };
    const streamHeartbeatService = {
      startRunning: jest.fn().mockReturnValue(() => {}),
      markClaimed: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
    };
    const job = new StreamAgentChatJob(
      threadRepository as never,
      workspaceRepository as never,
      agentChatService as never,
      chatExecutionService as never,
      eventPublisherService as never,
      cancelSubscriberService as never,
      agentChatStreamingService as never,
      streamHeartbeatService as never,
      { incrementCounterBy: jest.fn() } as never,
    );

    return {
      job,
      publishedEvents,
      threadRepository,
      agentChatService,
      eventPublisherService,
      agentChatStreamingService,
      cancelCallbacks,
    };
  };

  it('publishes all chunks in order with message-persisted last on success', async () => {
    const {
      job,
      publishedEvents,
      threadRepository,
      agentChatService,
      agentChatStreamingService,
    } = buildJob();

    await job.handle(jobData);

    const chunkEvents = publishedEvents.filter(
      (event) => event.type === 'stream-chunk',
    );

    expect(chunkEvents).toHaveLength(TEXT_CHUNKS.length);
    expect(publishedEvents[publishedEvents.length - 1]).toMatchObject({
      type: 'message-persisted',
    });
    expect(agentChatService.upsertAssistantMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        turnId: 'turn-id',
        parts: expect.arrayContaining([
          expect.objectContaining({ type: 'text' }),
        ]),
      }),
    );
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: 'stream-id' },
      expect.objectContaining({ lastStreamError: null }),
    );
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: 'stream-id' },
      { activeStreamId: null },
    );
    expect(agentChatStreamingService.flushNextQueuedMessage).toHaveBeenCalled();
  });

  it('gates the thread totals on still owning the stream so a prior completion is not double-counted', async () => {
    const { job, agentChatService, threadRepository } = buildJob({
      totalsUpdateAffected: 0,
    });

    await job.handle(jobData);

    expect(agentChatService.upsertAssistantMessage).toHaveBeenCalledWith(
      expect.objectContaining({ turnId: 'turn-id' }),
    );
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: 'stream-id' },
      expect.objectContaining({ lastStreamError: null }),
    );
    expect(agentChatService.notifyThreadUsageUpdated).not.toHaveBeenCalled();
  });

  it('applies thread totals when the claim is still held even if the message already exists from a checkpoint', async () => {
    const { job, agentChatService } = buildJob({ totalsUpdateAffected: 1 });

    await job.handle(jobData);

    expect(agentChatService.upsertAssistantMessage).toHaveBeenCalled();
    expect(agentChatService.notifyThreadUsageUpdated).toHaveBeenCalled();
  });

  it('never publishes the opaque error chunk to subscribers', async () => {
    const { job, publishedEvents } = buildJob({
      chatStream: createFakeChatStream({
        midStreamError: new Error('provider exploded'),
      }),
    });

    await expect(job.handle(jobData)).rejects.toThrow('provider exploded');

    const chunkTypes = publishedEvents
      .filter((event) => event.type === 'stream-chunk')
      .map((event) => (event.chunk as { type: string }).type);

    expect(chunkTypes).not.toContain('error');
  });

  it('rejects, persists the error, and unblocks the thread when the model stream fails mid-stream', async () => {
    const { job, publishedEvents, threadRepository } = buildJob({
      chatStream: createFakeChatStream({
        midStreamError: new Error('provider exploded'),
      }),
    });

    await expect(job.handle(jobData)).rejects.toThrow('provider exploded');

    const chunkEvents = publishedEvents.filter(
      (event) => event.type === 'stream-chunk',
    );

    expect(chunkEvents).toHaveLength(TEXT_CHUNKS.length);
    expect(publishedEvents[publishedEvents.length - 2]).toMatchObject({
      type: 'stream-error',
      code: 'STREAM_EXECUTION_FAILED',
      message: 'provider exploded',
    });
    expect(publishedEvents[publishedEvents.length - 1]).toMatchObject({
      type: 'queue-updated',
    });
    expect(publishedEvents.map((event) => event.type)).not.toContain(
      'message-persisted',
    );
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id' },
      {
        lastStreamError: expect.objectContaining({
          code: 'STREAM_EXECUTION_FAILED',
          message: 'provider exploded',
        }),
      },
    );
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: 'stream-id' },
      { activeStreamId: null },
    );
  });

  it('rejects promptly when execution setup throws instead of hanging until the queue lock expires', async () => {
    const { job, publishedEvents, threadRepository } = buildJob({
      streamChatRejection: new Error('model resolution failed'),
    });

    await expect(job.handle(jobData)).rejects.toThrow(
      'model resolution failed',
    );

    expect(publishedEvents[publishedEvents.length - 2]).toMatchObject({
      type: 'stream-error',
      message: 'model resolution failed',
    });
    expect(publishedEvents[publishedEvents.length - 1]).toMatchObject({
      type: 'queue-updated',
    });
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: 'stream-id' },
      { activeStreamId: null },
    );
  });

  it('terminates the stream with an error when assistant persistence fails after draining chunks', async () => {
    const { job, publishedEvents } = buildJob({
      assistantPersistRejection: new Error('insert failed'),
    });

    await expect(job.handle(jobData)).rejects.toThrow('insert failed');

    const chunkEvents = publishedEvents.filter(
      (event) => event.type === 'stream-chunk',
    );

    expect(chunkEvents).toHaveLength(TEXT_CHUNKS.length);
    expect(publishedEvents[publishedEvents.length - 2]).toMatchObject({
      type: 'stream-error',
    });
    expect(publishedEvents[publishedEvents.length - 1]).toMatchObject({
      type: 'queue-updated',
    });
    expect(publishedEvents.map((event) => event.type)).not.toContain(
      'message-persisted',
    );
  });

  it('persists the error and unblocks the thread when the workspace is missing', async () => {
    const { job, publishedEvents, threadRepository } = buildJob({
      workspaceFound: false,
    });

    await expect(job.handle(jobData)).rejects.toMatchObject({
      code: AiExceptionCode.WORKSPACE_NOT_FOUND,
    });

    expect(publishedEvents[publishedEvents.length - 2]).toMatchObject({
      type: 'stream-error',
      code: AiExceptionCode.WORKSPACE_NOT_FOUND,
    });
    expect(publishedEvents[publishedEvents.length - 1]).toMatchObject({
      type: 'queue-updated',
    });
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id' },
      {
        lastStreamError: expect.objectContaining({
          code: AiExceptionCode.WORKSPACE_NOT_FOUND,
        }),
      },
    );
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: 'stream-id' },
      { activeStreamId: null },
    );
  });

  it('bails out without streaming when the thread no longer holds the claim for this stream', async () => {
    const {
      job,
      publishedEvents,
      threadRepository,
      eventPublisherService,
      agentChatStreamingService,
    } = buildJob();

    threadRepository.findOne.mockResolvedValueOnce({
      id: 'thread-id',
      deletedAt: null,
      activeStreamId: 'newer-stream-id',
    });

    await job.handle(jobData);

    expect(publishedEvents).toHaveLength(0);
    expect(eventPublisherService.resetStreamState).not.toHaveBeenCalled();
    expect(threadRepository.update).not.toHaveBeenCalled();
    expect(
      agentChatStreamingService.flushNextQueuedMessage,
    ).not.toHaveBeenCalled();
  });

  it('bails out without streaming when the thread was deleted', async () => {
    const { job, publishedEvents, threadRepository, eventPublisherService } =
      buildJob();

    threadRepository.findOne.mockResolvedValueOnce(null);

    await job.handle(jobData);

    expect(publishedEvents).toHaveLength(0);
    expect(eventPublisherService.resetStreamState).not.toHaveBeenCalled();
    expect(threadRepository.update).not.toHaveBeenCalled();
  });

  it('persists the interrupted error and publishes the terminal sequence when aborted by a worker shutdown', async () => {
    let triggerShutdown: (() => void) | undefined;

    const {
      job,
      publishedEvents,
      threadRepository,
      agentChatStreamingService,
    } = buildJob({
      chatStream: createFakeChatStream({
        onFirstChunk: () => triggerShutdown?.(),
      }),
    });

    const shutdownController = new AbortController();

    triggerShutdown = () => shutdownController.abort();

    await expect(
      job.handle(jobData, { abortSignal: shutdownController.signal }),
    ).rejects.toMatchObject({ code: AiExceptionCode.STREAM_INTERRUPTED });

    const eventTypes = publishedEvents.map((event) => event.type);
    const streamErrorIndex = eventTypes.indexOf('stream-error');
    const queueUpdatedIndex = eventTypes.indexOf('queue-updated');

    expect(publishedEvents[streamErrorIndex]).toMatchObject({
      type: 'stream-error',
      code: AiExceptionCode.STREAM_INTERRUPTED,
    });
    expect(queueUpdatedIndex).toBeGreaterThan(streamErrorIndex);
    expect(eventTypes).not.toContain('message-persisted');
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id' },
      {
        lastStreamError: expect.objectContaining({
          code: AiExceptionCode.STREAM_INTERRUPTED,
        }),
      },
    );
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: 'stream-id' },
      { activeStreamId: null },
    );
    expect(
      agentChatStreamingService.flushNextQueuedMessage,
    ).not.toHaveBeenCalled();
  });

  it('keeps user-cancel semantics when a shutdown signal is wired but never aborted', async () => {
    let triggerUserCancel: (() => void) | undefined;

    const { job, publishedEvents, agentChatStreamingService, cancelCallbacks } =
      buildJob({
        chatStream: createFakeChatStream({
          onFirstChunk: () => triggerUserCancel?.(),
        }),
      });

    triggerUserCancel = () => cancelCallbacks.forEach((callback) => callback());

    const shutdownController = new AbortController();

    await job.handle(jobData, { abortSignal: shutdownController.signal });

    expect(publishedEvents.map((event) => event.type)).not.toContain(
      'stream-error',
    );
    expect(
      agentChatStreamingService.flushNextQueuedMessage,
    ).not.toHaveBeenCalled();
  });

  it('resolves without flushing the queue when the stream is cancelled', async () => {
    let triggerCancel: (() => void) | undefined;

    const {
      job,
      publishedEvents,
      agentChatService,
      agentChatStreamingService,
      cancelCallbacks,
    } = buildJob({
      chatStream: createFakeChatStream({
        onFirstChunk: () => triggerCancel?.(),
      }),
    });

    triggerCancel = () => cancelCallbacks.forEach((callback) => callback());

    await job.handle(jobData);

    expect(publishedEvents.map((event) => event.type)).not.toContain(
      'stream-error',
    );
    expect(
      agentChatStreamingService.flushNextQueuedMessage,
    ).not.toHaveBeenCalled();
    expect(agentChatService.notifyThreadUsageUpdated).toHaveBeenCalled();
  });
});
