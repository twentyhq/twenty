import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type AgentRunnerRunInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-run-input.type';

const CALLER = {
  type: 'WORKFLOW_STEP' as const,
  ref: { workflowRunId: 'run-id', stepId: 'step-id' },
};

const CREATED_BY = {
  source: 'WORKFLOW',
  name: 'New deals',
  workspaceMemberId: null,
  context: {},
} as AgentRunnerRunInput['createdBy'];

const PRIOR_MESSAGES = [{ id: 'message-id', role: 'assistant', parts: [] }];

const buildExecution = (
  overrides: Partial<AgentExecutionResult> = {},
): AgentExecutionResult => ({
  result: { answer: 'done' },
  usage: {
    inputTokens: 1,
    outputTokens: 2,
    totalTokens: 3,
  } as AgentExecutionResult['usage'],
  cacheCreationTokens: 0,
  nativeWebSearchCallCount: 0,
  hasNoMoreAvailableCredits: false,
  isPaused: false,
  steps: [],
  modelId: 'model-id',
  totalCostInDollars: 0,
  creditsUsedMicro: 0,
  turnUsage: {
    inputTokens: 1,
    outputTokens: 2,
    cacheReadTokens: 0,
    cacheCreationTokens: 0,
    inputCredits: 0,
    outputCredits: 0,
  },
  ...overrides,
});

const RUN_INPUT: AgentRunnerRunInput = {
  workspaceId: 'workspace-id',
  conversation: { threadId: 'thread-id', isCreated: false },
  caller: CALLER,
  title: 'Draft the quote',
  agent: null,
  prompt: 'Draft a quote',
  createdBy: CREATED_BY,
  baseSystemPrompt: 'base prompt',
  pausingTools: {},
  canProposeToolCalls: false,
  authContext: { type: 'system' } as AgentRunnerRunInput['authContext'],
  userWorkspaceId: 'user-workspace-id',
};

const buildService = (execution = buildExecution()) => {
  const agentAsyncExecutorService = {
    executeAgent: jest.fn().mockResolvedValue(execution),
  };
  const agentCallerConversationService = {
    openTurn: jest.fn().mockResolvedValue('turn-id'),
    closeTurn: jest.fn().mockResolvedValue({ isAwaitingAnswer: false }),
    failTurn: jest.fn().mockResolvedValue(undefined),
  };
  const conversationReaderService = {
    loadMessages: jest.fn().mockResolvedValue(PRIOR_MESSAGES),
  };

  const service = new AgentRunnerService(
    agentAsyncExecutorService as never,
    agentCallerConversationService as never,
    conversationReaderService as never,
  );

  return {
    service,
    agentAsyncExecutorService,
    agentCallerConversationService,
    conversationReaderService,
  };
};

const pausedOnWait = buildExecution({
  isPaused: true,
  steps: [
    { content: [], toolResults: [{ toolName: 'search', output: {} }] },
    {
      content: [],
      toolResults: [
        {
          toolName: 'wait_for_event',
          output: { result: { status: 'pending' } },
        },
      ],
    },
  ] as unknown as AgentExecutionResult['steps'],
});

describe('AgentRunnerService', () => {
  it('records the prompt, runs the agent from the conversation and completes', async () => {
    const {
      service,
      agentAsyncExecutorService,
      agentCallerConversationService,
    } = buildService();

    const { threadId, outcome, summary } = await service.run(RUN_INPUT);

    expect(threadId).toBe('thread-id');
    expect(outcome).toEqual({
      status: 'COMPLETED',
      result: { answer: 'done' },
    });
    expect(summary).toMatchObject({ modelId: 'model-id', toolCalls: [] });
    expect(agentCallerConversationService.openTurn).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      agentId: null,
      prompt: 'Draft a quote',
      senderUserWorkspaceId: 'user-workspace-id',
      createdBy: CREATED_BY,
    });
    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: 'user', content: 'Draft a quote' }],
        priorMessages: PRIOR_MESSAGES,
        baseSystemPrompt: 'base prompt',
      }),
    );
    expect(agentCallerConversationService.closeTurn).toHaveBeenCalledWith(
      expect.objectContaining({ turnId: 'turn-id', caller: CALLER }),
    );
  });

  it('reads nothing back from a conversation it just created', async () => {
    const { service, conversationReaderService, agentAsyncExecutorService } =
      buildService();

    await service.run({
      ...RUN_INPUT,
      conversation: { threadId: 'thread-id', isCreated: true },
    });

    expect(conversationReaderService.loadMessages).not.toHaveBeenCalled();
    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({ priorMessages: [] }),
    );
  });

  it('continues a paused run from its conversation alone', async () => {
    const { service, agentAsyncExecutorService } = buildService();

    await service.run({ ...RUN_INPUT, prompt: null });

    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({ messages: [], priorMessages: PRIOR_MESSAGES }),
    );
  });

  it('reports a run that ran out of credits', async () => {
    const { service } = buildService(
      buildExecution({ hasNoMoreAvailableCredits: true }),
    );

    await expect(service.run(RUN_INPUT)).resolves.toMatchObject({
      outcome: { status: 'NO_CREDITS' },
    });
  });

  it('reports a run awaiting an answer once its question is recorded', async () => {
    const { service, agentCallerConversationService } = buildService(
      buildExecution({ isPaused: true }),
    );

    agentCallerConversationService.closeTurn.mockResolvedValue({
      isAwaitingAnswer: true,
    });

    await expect(service.run(RUN_INPUT)).resolves.toMatchObject({
      outcome: { status: 'AWAITING_ANSWER' },
    });
  });

  it('hands back the calls of the last step a run paused on', async () => {
    const { service } = buildService(pausedOnWait);

    await expect(service.run(RUN_INPUT)).resolves.toMatchObject({
      outcome: {
        status: 'PAUSED',
        isResumable: true,
        pausedToolResults: [
          {
            toolName: 'wait_for_event',
            output: { result: { status: 'pending' } },
          },
        ],
      },
    });
  });

  it('cannot resume a pause it failed to record', async () => {
    const { service, agentCallerConversationService } =
      buildService(pausedOnWait);

    agentCallerConversationService.closeTurn.mockRejectedValue(
      new Error('db down'),
    );

    await expect(service.run(RUN_INPUT)).resolves.toMatchObject({
      outcome: { status: 'PAUSED', isResumable: false },
    });
  });

  it('runs the agent even when its turn cannot be recorded', async () => {
    const {
      service,
      agentCallerConversationService,
      agentAsyncExecutorService,
    } = buildService();

    agentCallerConversationService.openTurn.mockRejectedValue(
      new Error('db down'),
    );

    await expect(service.run(RUN_INPUT)).resolves.toMatchObject({
      outcome: { status: 'COMPLETED' },
    });
    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalled();
    expect(agentCallerConversationService.closeTurn).not.toHaveBeenCalled();
  });

  it('fails the turn of a run that throws', async () => {
    const {
      service,
      agentAsyncExecutorService,
      agentCallerConversationService,
    } = buildService();
    const error = new Error('provider down');

    agentAsyncExecutorService.executeAgent.mockRejectedValue(error);

    await expect(service.run(RUN_INPUT)).rejects.toThrow('provider down');
    expect(agentCallerConversationService.failTurn).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      turnId: 'turn-id',
      error,
    });
  });
});
