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

// Emulates the AI SDK model stream consumed via toUIMessageStream: emits the
// given chunks, then either reports a mid-stream error through onError (like
// a provider failure) or completes through onFinish.
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

        // The AI SDK fires onFinish after the stream ends even when an error
        // part was emitted; the job relies on that to settle
        // streamFinishedPromise on the mid-stream failure path.
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
  }: {
    workspaceFound?: boolean;
    chatStream?: ReturnType<typeof createFakeChatStream>;
    streamChatRejection?: Error;
    addMessageRejection?: Error;
  } = {}) => {
    const publishedEvents: PublishedEvent[] = [];

    const threadRepository = {
      findOne: jest
        .fn()
        .mockResolvedValue({ id: 'thread-id', deletedAt: null }),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const workspaceRepository = {
      findOne: jest.fn().mockResolvedValue(workspaceFound ? workspace : null),
    };
    const agentChatService = {
      addMessage: addMessageRejection
        ? jest.fn().mockRejectedValue(addMessageRejection)
        : jest.fn().mockResolvedValue({ id: 'assistant-message-id' }),
      hasMessageById: jest.fn().mockResolvedValue(false),
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
    const messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };

    const job = new StreamAgentChatJob(
      threadRepository as never,
      workspaceRepository as never,
      agentChatService as never,
      chatExecutionService as never,
      eventPublisherService as never,
      cancelSubscriberService as never,
      agentChatStreamingService as never,
      messageQueueService as never,
    );

    return {
      job,
      publishedEvents,
      threadRepository,
      agentChatService,
      eventPublisherService,
      agentChatStreamingService,
      messageQueueService,
      cancelCallbacks,
    };
  };

  it('publishes all chunks in order with message-persisted last on success', async () => {
    const { job, publishedEvents, threadRepository, agentChatService } =
      buildJob();

    await job.handle(jobData);

    const chunkEvents = publishedEvents.filter(
      (event) => event.type === 'stream-chunk',
    );

    expect(chunkEvents).toHaveLength(TEXT_CHUNKS.length);
    expect(publishedEvents[publishedEvents.length - 1]).toMatchObject({
      type: 'message-persisted',
    });
    expect(agentChatService.addMessage).toHaveBeenCalledWith(
      expect.objectContaining({ turnId: 'turn-id' }),
    );
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id' },
      expect.objectContaining({ lastStreamError: null }),
    );
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: 'stream-id' },
      { activeStreamId: null },
    );
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
    const {
      job,
      publishedEvents,
      threadRepository,
      agentChatStreamingService,
    } = buildJob({
      chatStream: createFakeChatStream({
        midStreamError: new Error('provider exploded'),
      }),
    });

    await expect(job.handle(jobData)).rejects.toThrow('provider exploded');

    const chunkEvents = publishedEvents.filter(
      (event) => event.type === 'stream-chunk',
    );

    expect(chunkEvents).toHaveLength(TEXT_CHUNKS.length);
    expect(publishedEvents[publishedEvents.length - 1]).toMatchObject({
      type: 'stream-error',
      code: 'STREAM_EXECUTION_FAILED',
      message: 'provider exploded',
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
    expect(agentChatStreamingService.flushNextQueuedMessage).toHaveBeenCalled();
  });

  // Regression: a throw before the model stream merges (execute phase) used to
  // bypass onFinish entirely and leave the job hanging until the 10-minute
  // BullMQ lock expired.
  it('rejects promptly when chat execution setup throws', async () => {
    const { job, publishedEvents, threadRepository } = buildJob({
      streamChatRejection: new Error('model resolution failed'),
    });

    await expect(job.handle(jobData)).rejects.toThrow(
      'model resolution failed',
    );

    expect(publishedEvents[publishedEvents.length - 1]).toMatchObject({
      type: 'stream-error',
      message: 'model resolution failed',
    });
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: 'stream-id' },
      { activeStreamId: null },
    );
  });

  // Regression: a throw inside onFinish (e.g. persistence failure) used to
  // leave trailing chunks published but the stream never terminated — the
  // client spinner ran forever.
  it('rejects after draining chunks when assistant persistence fails', async () => {
    const { job, publishedEvents } = buildJob({
      addMessageRejection: new Error('insert failed'),
    });

    await expect(job.handle(jobData)).rejects.toThrow('insert failed');

    const chunkEvents = publishedEvents.filter(
      (event) => event.type === 'stream-chunk',
    );

    expect(chunkEvents).toHaveLength(TEXT_CHUNKS.length);
    expect(publishedEvents[publishedEvents.length - 1]).toMatchObject({
      type: 'stream-error',
    });
    expect(publishedEvents.map((event) => event.type)).not.toContain(
      'message-persisted',
    );
  });

  // Regression: the missing-workspace early return used to skip the finally
  // block — activeStreamId was never cleared, so every subsequent send queued
  // forever behind a stream that would never end.
  it('persists the error and unblocks the thread when the workspace is missing', async () => {
    const {
      job,
      publishedEvents,
      threadRepository,
      agentChatStreamingService,
    } = buildJob({ workspaceFound: false });

    await expect(job.handle(jobData)).rejects.toMatchObject({
      code: AiExceptionCode.WORKSPACE_NOT_FOUND,
    });

    expect(publishedEvents[publishedEvents.length - 1]).toMatchObject({
      type: 'stream-error',
      code: AiExceptionCode.WORKSPACE_NOT_FOUND,
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
    expect(agentChatStreamingService.flushNextQueuedMessage).toHaveBeenCalled();
  });

  describe('transient-error auto-retry', () => {
    it('silently re-enqueues once when a transient error happens before any chunk', async () => {
      const {
        job,
        publishedEvents,
        threadRepository,
        messageQueueService,
        agentChatStreamingService,
      } = buildJob({
        streamChatRejection: new Error('fetch failed'),
      });

      await job.handle(jobData);

      expect(messageQueueService.add).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          isAutoRetry: true,
          existingTurnId: 'turn-id',
          streamId: expect.not.stringMatching(/^stream-id$/),
        }),
        expect.objectContaining({ delay: expect.any(Number) }),
      );
      expect(threadRepository.update).toHaveBeenCalledWith(
        'workspace-id',
        { id: 'thread-id', activeStreamId: 'stream-id' },
        { activeStreamId: expect.any(String) },
      );
      expect(publishedEvents.map((event) => event.type)).not.toContain(
        'stream-error',
      );
      expect(threadRepository.update).not.toHaveBeenCalledWith(
        'workspace-id',
        { id: 'thread-id' },
        expect.objectContaining({ lastStreamError: expect.anything() }),
      );
      expect(
        agentChatStreamingService.flushNextQueuedMessage,
      ).not.toHaveBeenCalled();
    });

    it('surfaces the error when the retried attempt fails again', async () => {
      const { job, publishedEvents, messageQueueService } = buildJob({
        streamChatRejection: new Error('fetch failed'),
      });

      await expect(
        job.handle({ ...jobData, isAutoRetry: true }),
      ).rejects.toThrow('fetch failed');

      expect(messageQueueService.add).not.toHaveBeenCalled();
      expect(publishedEvents[publishedEvents.length - 1]).toMatchObject({
        type: 'stream-error',
      });
    });

    it('surfaces the error without retrying when chunks already reached the client', async () => {
      const { job, publishedEvents, messageQueueService } = buildJob({
        chatStream: createFakeChatStream({
          midStreamError: new Error('fetch failed'),
        }),
      });

      await expect(job.handle(jobData)).rejects.toThrow('fetch failed');

      expect(messageQueueService.add).not.toHaveBeenCalled();
      expect(publishedEvents[publishedEvents.length - 1]).toMatchObject({
        type: 'stream-error',
      });
    });

    it('surfaces the error when the stream claim was lost to a stop or newer stream', async () => {
      const { job, publishedEvents, threadRepository, messageQueueService } =
        buildJob({
          streamChatRejection: new Error('fetch failed'),
        });

      threadRepository.update.mockResolvedValue({ affected: 0 });

      await expect(job.handle(jobData)).rejects.toThrow('fetch failed');

      expect(messageQueueService.add).not.toHaveBeenCalled();
      expect(publishedEvents[publishedEvents.length - 1]).toMatchObject({
        type: 'stream-error',
      });
    });
  });

  it('resolves without flushing the queue when the stream is cancelled', async () => {
    let triggerCancel: (() => void) | undefined;

    const { job, publishedEvents, agentChatStreamingService, cancelCallbacks } =
      buildJob({
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
  });
});
