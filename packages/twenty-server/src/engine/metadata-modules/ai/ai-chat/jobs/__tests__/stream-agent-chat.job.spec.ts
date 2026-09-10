import { type LanguageModelUsage, type TextStreamPart, type ToolSet } from 'ai';
import { ASK_QUESTIONS_TOOL_NAME } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { StreamAgentChatJob } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat.job';
import { type StreamAgentChatJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat-job.types';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

type PublishedEvent = { type: string } & Record<string, unknown>;

type ModelStreamPart = TextStreamPart<ToolSet>;

const USAGE: LanguageModelUsage = {
  inputTokens: 12,
  inputTokenDetails: {
    noCacheTokens: 12,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
  },
  outputTokens: 3,
  outputTokenDetails: { textTokens: 3, reasoningTokens: 0 },
  totalTokens: 15,
};

const START_PARTS: ModelStreamPart[] = [
  { type: 'start' },
  { type: 'start-step', request: {}, warnings: [] },
];

const FINISH_PARTS: ModelStreamPart[] = [
  {
    type: 'finish-step',
    response: {
      id: 'response-id',
      timestamp: new Date(0),
      modelId: 'gpt-5.6-luna',
    },
    usage: USAGE,
    performance: {
      effectiveOutputTokensPerSecond: 0,
      outputTokensPerSecond: undefined,
      inputTokensPerSecond: undefined,
      effectiveTotalTokensPerSecond: 0,
      stepTimeMs: 0,
      responseTimeMs: 0,
      timeToFirstOutputMs: 0,
      toolExecutionMs: {},
    },
    finishReason: 'stop',
    rawFinishReason: undefined,
    providerMetadata: undefined,
  },
  {
    type: 'finish',
    finishReason: 'stop',
    rawFinishReason: undefined,
    totalUsage: USAGE,
  },
];

const TEXT_PARTS: ModelStreamPart[] = [
  ...START_PARTS,
  { type: 'text-start', id: 'text-1' },
  { type: 'text-delta', id: 'text-1', text: 'Hello' },
  { type: 'text-end', id: 'text-1' },
  ...FINISH_PARTS,
];

const EMPTY_REPLY_PARTS: ModelStreamPart[] = [...START_PARTS, ...FINISH_PARTS];

const PENDING_QUESTION_PARTS: ModelStreamPart[] = [
  ...START_PARTS,
  {
    type: 'tool-input-start',
    id: 'tool-call-id',
    toolName: ASK_QUESTIONS_TOOL_NAME,
  },
  {
    type: 'tool-call',
    toolCallId: 'tool-call-id',
    toolName: ASK_QUESTIONS_TOOL_NAME,
    input: {},
  },
  {
    type: 'tool-result',
    toolCallId: 'tool-call-id',
    toolName: ASK_QUESTIONS_TOOL_NAME,
    input: {},
    output: { result: { status: 'pending' } },
  },
  ...FINISH_PARTS,
];

const createFakeChatStream = ({
  parts = TEXT_PARTS,
  midStreamError,
  onFirstPart,
  isAborted = false,
}: {
  parts?: ModelStreamPart[];
  midStreamError?: Error;
  onFirstPart?: () => void;
  isAborted?: boolean;
} = {}) => ({
  stream: new ReadableStream<ModelStreamPart>(
    {
      pull(controller) {
        parts.forEach((part, index) => {
          controller.enqueue(part);

          if (index === 0) {
            onFirstPart?.();
          }
        });

        if (midStreamError) {
          controller.enqueue({ type: 'error', error: midStreamError });
        }

        if (isAborted) {
          controller.enqueue({ type: 'abort' });
        }

        controller.close();
      },
    },
    // Produced on the first read, so the tests' triggers fire while the job is streaming.
    { highWaterMark: 0 },
  ),
});

describe('StreamAgentChatJob', () => {
  const workspace = {
    id: 'workspace-id',
    smartModel: 'default-smart-model',
  } as WorkspaceEntity;

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
    finalPublishRejection,
  }: {
    workspaceFound?: boolean;
    chatStream?: ReturnType<typeof createFakeChatStream>;
    streamChatRejection?: Error;
    addMessageRejection?: Error;
    assistantPersistRejection?: Error;
    totalsUpdateAffected?: number;
    finalPublishRejection?: Error;
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
            modelConfig: {
              contextWindowTokens: 100000,
              inputCostPerMillionTokens: 1,
              outputCostPerMillionTokens: 2,
            },
            hasNoMoreAvailableCredits: () => false,
          }),
    };
    const eventPublisherService = {
      resetStreamState: jest.fn().mockResolvedValue(undefined),
      publish: jest
        .fn()
        .mockImplementation(({ event }: { event: PublishedEvent }) => {
          if (
            isDefined(finalPublishRejection) &&
            event.type === 'message-persisted'
          ) {
            return Promise.reject(finalPublishRejection);
          }

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
    const metricsService = { incrementCounterBy: jest.fn() };
    const aiModelRegistryService = {
      getEffectiveModelConfig: jest
        .fn()
        .mockReturnValue({ modelId: 'openai/gpt-5.6-luna' }),
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
      metricsService as never,
      aiModelRegistryService as never,
      {
        onThreadCreated: jest.fn(),
        onTurnCompleted: jest.fn(),
        onThreadRemoved: jest.fn(),
      } as never,
    );

    const turnCounts = (key: string) =>
      metricsService.incrementCounterBy.mock.calls
        .map(([call]) => call)
        .filter((call: { key: string }) => call.key === key);

    return {
      job,
      publishedEvents,
      threadRepository,
      agentChatService,
      eventPublisherService,
      agentChatStreamingService,
      cancelCallbacks,
      metricsService,
      aiModelRegistryService,
      turnCounts,
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

    expect(
      chunkEvents.map((event) => (event.chunk as { type: string }).type),
    ).toEqual(TEXT_PARTS.map((part) => part.type));
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

    expect(chunkEvents).toHaveLength(TEXT_PARTS.length);
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

    expect(chunkEvents).toHaveLength(TEXT_PARTS.length);
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
        onFirstPart: () => triggerShutdown?.(),
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
          onFirstPart: () => triggerUserCancel?.(),
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
        onFirstPart: () => triggerCancel?.(),
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
  it('labels turn-started with the resolved model, not the auto-select id', async () => {
    const { job, aiModelRegistryService, turnCounts } = buildJob();

    await job.handle({ ...jobData, modelId: 'default-fast-model' });

    expect(aiModelRegistryService.getEffectiveModelConfig).toHaveBeenCalledWith(
      'default-fast-model',
    );
    expect(turnCounts('ai-chat/turn-started')).toEqual([
      expect.objectContaining({
        attributes: { model: 'openai/gpt-5.6-luna' },
      }),
    ]);
  });

  it('falls back to the workspace default model when the turn did not pick one', async () => {
    const { job, aiModelRegistryService } = buildJob();

    await job.handle(jobData);

    expect(aiModelRegistryService.getEffectiveModelConfig).toHaveBeenCalledWith(
      'default-smart-model',
    );
  });

  it('counts a text reply once, as an answered completion', async () => {
    const { job, turnCounts } = buildJob();

    await job.handle(jobData);

    expect(turnCounts('ai-chat/turn-completed')).toEqual([
      expect.objectContaining({
        attributes: { model: 'openai/gpt-5.6-luna', outcome: 'answered' },
      }),
    ]);
    expect(turnCounts('ai-chat/turn-failed')).toEqual([]);
    expect(turnCounts('ai-chat/turn-cancelled')).toEqual([]);
  });

  it('counts a turn that ended on a question as completed and awaiting the user', async () => {
    const { job, turnCounts } = buildJob({
      chatStream: createFakeChatStream({
        parts: PENDING_QUESTION_PARTS,
      }),
    });

    await job.handle(jobData);

    expect(turnCounts('ai-chat/turn-completed')).toEqual([
      expect.objectContaining({
        attributes: { model: 'openai/gpt-5.6-luna', outcome: 'awaiting_user' },
      }),
    ]);
    expect(turnCounts('ai-chat/turn-failed')).toEqual([]);
  });

  it('counts an aborted turn as cancelled rather than leaving it unaccounted', async () => {
    const { job, turnCounts } = buildJob({
      chatStream: createFakeChatStream({
        parts: START_PARTS,
        isAborted: true,
      }),
    });

    await job.handle(jobData);

    expect(turnCounts('ai-chat/turn-cancelled')).toEqual([
      expect.objectContaining({
        attributes: {
          model: 'openai/gpt-5.6-luna',
          reason: 'user_cancelled',
        },
      }),
    ]);
    expect(turnCounts('ai-chat/turn-completed')).toEqual([]);
  });

  it('counts a turn whose claim moved on as superseded', async () => {
    const { job, turnCounts } = buildJob({ totalsUpdateAffected: 0 });

    await job.handle(jobData);

    expect(turnCounts('ai-chat/turn-cancelled')).toEqual([
      expect.objectContaining({
        attributes: { model: 'openai/gpt-5.6-luna', reason: 'superseded' },
      }),
    ]);
    expect(turnCounts('ai-chat/turn-completed')).toEqual([]);
  });

  it('counts an empty reply as a no_text failure exactly once', async () => {
    const { job, turnCounts } = buildJob({
      chatStream: createFakeChatStream({
        parts: EMPTY_REPLY_PARTS,
      }),
    });

    await job.handle(jobData);

    expect(turnCounts('ai-chat/turn-failed')).toEqual([
      expect.objectContaining({
        attributes: { model: 'openai/gpt-5.6-luna', failure_phase: 'no_text' },
      }),
    ]);
  });

  it('leaves a stream error to the execution counter so it is not counted twice', async () => {
    const { job, turnCounts } = buildJob({
      streamChatRejection: new Error('provider exploded'),
    });

    await job.handle(jobData).catch(() => {});

    expect(turnCounts('ai-chat/turn-failed')).toEqual([
      expect.objectContaining({
        attributes: expect.objectContaining({
          model: 'openai/gpt-5.6-luna',
          failure_phase: 'execution',
        }),
      }),
    ]);
    expect(turnCounts('ai-chat/turn-completed')).toEqual([]);
  });

  it('records exactly one outcome for every started turn', async () => {
    const scenarios = [
      buildJob(),
      buildJob({ totalsUpdateAffected: 0 }),
      buildJob({
        chatStream: createFakeChatStream({
          parts: PENDING_QUESTION_PARTS,
        }),
      }),
      buildJob({
        chatStream: createFakeChatStream({
          parts: START_PARTS,
          isAborted: true,
        }),
      }),
      buildJob({ streamChatRejection: new Error('provider exploded') }),
    ];

    for (const scenario of scenarios) {
      await scenario.job.handle(jobData).catch(() => {});

      const started = scenario.turnCounts('ai-chat/turn-started').length;
      const terminal =
        scenario.turnCounts('ai-chat/turn-completed').length +
        scenario.turnCounts('ai-chat/turn-cancelled').length +
        scenario.turnCounts('ai-chat/turn-failed').length;

      expect({ started, terminal }).toEqual({ started: 1, terminal: 1 });
    }
  });
  it('does not count a turn twice when the final publish fails after the outcome was recorded', async () => {
    const { job, turnCounts } = buildJob({
      finalPublishRejection: new Error('redis is down'),
    });

    await job.handle(jobData).catch(() => {});

    expect(turnCounts('ai-chat/turn-completed')).toEqual([
      expect.objectContaining({
        attributes: { model: 'openai/gpt-5.6-luna', outcome: 'answered' },
      }),
    ]);
    expect(turnCounts('ai-chat/turn-failed')).toEqual([]);
    expect(turnCounts('ai-chat/turn-started')).toHaveLength(1);
  });
});
