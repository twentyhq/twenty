import { Logger } from '@nestjs/common';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type AgentRunnerRunInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-run-input.type';

const CREATED_BY = {
  source: 'WORKFLOW',
  name: 'New deals',
  workspaceMemberId: null,
  context: {},
} as AgentRunnerRunInput['executionContext']['turnCreatedBy'];

const PRIOR_MESSAGES = [{ id: 'message-id', role: 'assistant', parts: [] }];

const MESSAGES = [{ role: 'user' as const, content: 'Draft a quote' }];

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
  caller: {
    type: 'WORKFLOW_STEP',
    ref: { workflowRunId: 'run', stepId: 'step' },
  },
  spec: {
    agentId: null,
    title: 'Draft the quote',
    baseSystemPrompt: 'base prompt',
    instructions: null,
    capabilities: {
      canAskHumans: false,
    },
  },
  agent: null,
  prompt: {
    messages: MESSAGES,
    senderUserWorkspaceId: 'user-workspace-id',
    senderApplicationId: null,
  },
  executionContext: {
    authContext: {} as never,
    userWorkspaceId: 'user-workspace-id',
    rolePermissionConfig: { intersectionOf: [] },
    conversationActor: { type: 'application', applicationId: 'app-id' },
    turnCreatedBy: CREATED_BY,
    usageOperationType: UsageOperationType.AI_WORKFLOW_TOKEN,
  },
};

const buildService = (execution = buildExecution()) => {
  const agentAsyncExecutorService = {
    executeAgent: jest.fn().mockResolvedValue(execution),
  };
  const agentRunConversationService = {
    openTurn: jest.fn().mockResolvedValue('turn-id'),
    closeTurn: jest.fn().mockResolvedValue({ isAwaitingAnswer: false }),
    failTurn: jest.fn().mockResolvedValue(undefined),
    withThreadLock: jest.fn(({ work }) => work()),
  };
  const conversationReaderService = {
    loadMessages: jest.fn().mockResolvedValue(PRIOR_MESSAGES),
  };
  const agentRunService = {
    assertConversationNotSuspended: jest.fn().mockResolvedValue(undefined),
    closeAwaitedCalls: jest.fn().mockResolvedValue(undefined),
    recordOutcome: jest.fn().mockResolvedValue(undefined),
  };
  const runRepository = {
    insert: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  jest.spyOn(Logger.prototype, 'error').mockImplementation();

  const service = new AgentRunnerService(
    agentAsyncExecutorService as never,
    agentRunConversationService as never,
    conversationReaderService as never,
    agentRunService as never,
    {} as never,
    {} as never,
    runRepository as never,
    {} as never,
  );

  return {
    service,
    agentAsyncExecutorService,
    agentRunConversationService,
    conversationReaderService,
    agentRunService,
    runRepository,
  };
};

describe('AgentRunnerService', () => {
  it('continues a conversation under its lock and records the turn', async () => {
    const {
      service,
      agentAsyncExecutorService,
      agentRunConversationService,
      conversationReaderService,
    } = buildService();

    const { threadId, outcome, summary } = await service.run(RUN_INPUT);

    expect(threadId).toBe('thread-id');
    expect(outcome).toEqual({
      status: 'COMPLETED',
      result: { answer: 'done' },
    });
    expect(summary).toMatchObject({ modelId: 'model-id', toolCalls: [] });
    expect(agentRunConversationService.withThreadLock).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'workspace-id',
        threadId: 'thread-id',
      }),
    );
    expect(conversationReaderService.loadMessages).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      actor: { type: 'application', applicationId: 'app-id' },
    });
    expect(agentRunConversationService.openTurn).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      title: 'Draft the quote',
      agentId: null,
      senderUserWorkspaceId: 'user-workspace-id',
      senderApplicationId: null,
      createdBy: CREATED_BY,
      messages: MESSAGES,
    });
    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: MESSAGES,
        baseSystemPrompt: expect.stringMatching(
          /^base prompt\n\n.*wait_for_event/,
        ),
        priorMessages: PRIOR_MESSAGES,
        executionContext: RUN_INPUT.executionContext,
      }),
    );
    expect(agentRunConversationService.closeTurn).toHaveBeenCalledWith(
      expect.objectContaining({
        turnId: 'turn-id',
        title: 'Draft the quote',
      }),
    );
  });

  it.each([true, false])(
    'offers every human-input tool only to a run that can ask humans (%s)',
    async (canAskHumans) => {
      const { service, agentAsyncExecutorService } = buildService();

      await service.run({
        ...RUN_INPUT,
        spec: { ...RUN_INPUT.spec, capabilities: { canAskHumans } },
      });

      expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
        expect.objectContaining({ canAskHumans }),
      );
    },
  );

  it('locks a conversation it just created without reading it', async () => {
    const {
      service,
      agentRunConversationService,
      conversationReaderService,
      agentAsyncExecutorService,
    } = buildService();

    await service.run({
      ...RUN_INPUT,
      conversation: { threadId: 'thread-id', isCreated: true },
    });

    expect(agentRunConversationService.withThreadLock).toHaveBeenCalledWith(
      expect.objectContaining({ threadId: 'thread-id' }),
    );
    expect(conversationReaderService.loadMessages).not.toHaveBeenCalled();
    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({ priorMessages: [] }),
    );
  });

  it('still runs the agent when the turn cannot be opened', async () => {
    const { service, agentAsyncExecutorService, agentRunConversationService } =
      buildService();

    agentRunConversationService.openTurn.mockRejectedValue(
      new Error('db down'),
    );

    const { outcome } = await service.run(RUN_INPUT);

    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalled();
    expect(agentRunConversationService.closeTurn).not.toHaveBeenCalled();
    expect(outcome).toEqual({
      status: 'COMPLETED',
      result: { answer: 'done' },
    });
  });

  it('records a run from its start to its outcome', async () => {
    const { service, agentRunService, runRepository } = buildService();

    const { runId, summary } = await service.run({
      ...RUN_INPUT,
      runId: 'run-id',
    });

    expect(runId).toBe('run-id');
    expect(runRepository.insert).toHaveBeenCalledWith('workspace-id', {
      id: 'run-id',
      threadId: 'thread-id',
      caller: RUN_INPUT.caller,
      runSpec: RUN_INPUT.spec,
      status: 'RUNNING',
    });
    expect(agentRunService.recordOutcome).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      runId: 'run-id',
      outcome: { status: 'COMPLETED', result: { answer: 'done' } },
      summary,
    });
  });

  it('suspends a run that pauses on a question, keeping its conversation', async () => {
    const {
      service,
      agentRunConversationService,
      agentRunService,
      runRepository,
    } = buildService(buildExecution({ isPaused: true }));

    agentRunConversationService.closeTurn.mockResolvedValue({
      isAwaitingAnswer: true,
    });

    const { runId, outcome, summary } = await service.run(RUN_INPUT);

    expect(outcome).toEqual({ status: 'SUSPENDED' });
    expect(runRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: runId, status: 'RUNNING' },
      { status: 'SUSPENDED', summary },
    );
    expect(agentRunService.recordOutcome).not.toHaveBeenCalled();
  });

  it('fails the turn of a run that throws', async () => {
    const {
      service,
      agentAsyncExecutorService,
      agentRunConversationService,
      agentRunService,
    } = buildService();
    const error = new Error('provider down');

    agentAsyncExecutorService.executeAgent.mockRejectedValue(error);

    await expect(service.run(RUN_INPUT)).rejects.toThrow('provider down');
    expect(agentRunConversationService.failTurn).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      turnId: 'turn-id',
      error,
    });
    expect(agentRunConversationService.closeTurn).not.toHaveBeenCalled();
    expect(agentRunService.recordOutcome).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: { status: 'FAILED', error: 'provider down' },
      }),
    );
  });

  it('fails a run that ran out of credits', async () => {
    const { service } = buildService(
      buildExecution({ hasNoMoreAvailableCredits: true }),
    );

    await expect(service.run(RUN_INPUT)).resolves.toMatchObject({
      outcome: {
        status: 'FAILED',
        error: 'Agent stopped: no more available credits.',
      },
    });
  });
});
