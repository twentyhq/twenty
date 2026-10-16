import { createScriptedLanguageModel } from 'test/utils/create-scripted-language-model.util';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import {
  AgentRunTurnService,
  type StartedAgentRunTurn,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-turn.service';
import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';

const USAGE = {
  inputTokens: {
    total: 1_000_000,
    noCache: 1_000_000,
    cacheRead: undefined,
    cacheWrite: undefined,
  },
  outputTokens: { total: 1_000_000, text: 1_000_000, reasoning: undefined },
};

const RESPONSE_FORMAT = {
  type: 'json' as const,
  schema: {
    type: 'object' as const,
    properties: { answer: { type: 'string' as const } },
    required: ['answer'],
  },
};

const buildStartedTurn = (
  onCall: (options: { abortSignal?: AbortSignal }) => void = () => {},
): StartedAgentRunTurn =>
  ({
    turn: {
      stream: {
        text: Promise.resolve('The answer is 42'),
        usage: Promise.resolve({
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
        }),
        steps: Promise.resolve([]),
      },
      registeredModel: {
        modelId: 'model-id',
        sdkPackage: '@ai-sdk/openai',
        model: createScriptedLanguageModel((options) => {
          onCall(options);

          return {
            content: [{ type: 'text', text: JSON.stringify({ answer: '42' }) }],
            finishReason: { unified: 'stop', raw: undefined },
            usage: USAGE,
          };
        }),
      },
      toolset: { offeredPausingToolNames: [] },
      modelConfig: {
        inputCostPerMillionTokens: 1,
        outputCostPerMillionTokens: 2,
      },
      hasNoMoreAvailableCredits: () => false,
    },
    spenders: {},
  }) as never;

const buildService = () =>
  new AgentRunTurnService(
    {} as never,
    {
      calculateAndBillUsage: jest.fn().mockResolvedValue(undefined),
      calculateStepsCost: jest.fn().mockReturnValue(0),
    } as never,
    {} as never,
    {} as never,
    {} as never,
  );

const completeTurnInput = {
  agent: { id: 'agent-id' } as AgentEntity,
  responseFormat: RESPONSE_FORMAT,
  workspaceId: 'workspace-id',
  executionContext: {
    userWorkspaceId: null,
    usageOperationType: UsageOperationType.AI_WORKFLOW_TOKEN,
  } as never,
};

describe('AgentRunTurnService', () => {
  it('adds the usage of the structured output request to the turn it ends', async () => {
    const turnUsage = {
      inputTokens: 5,
      outputTokens: 5,
      cacheReadTokens: 0,
      cacheCreationTokens: 0,
      inputCredits: 0,
      outputCredits: 0,
    };

    const execution = await buildService().completeTurn({
      ...completeTurnInput,
      started: buildStartedTurn(),
      turnUsage,
    });

    expect(execution.result).toEqual({ answer: '42' });
    expect(turnUsage).toMatchObject({
      inputTokens: 1_000_005,
      outputTokens: 1_000_005,
    });
    expect(turnUsage.inputCredits).toBeGreaterThan(0);
    expect(turnUsage.outputCredits).toBeGreaterThan(turnUsage.inputCredits);
  });

  it('asks for the structured output under the stop signal of the run', async () => {
    const abortController = new AbortController();
    let requestSignal: AbortSignal | undefined;

    await buildService().completeTurn({
      ...completeTurnInput,
      started: buildStartedTurn(({ abortSignal }) => {
        requestSignal = abortSignal;
      }),
      abortSignal: abortController.signal,
      turnUsage: {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        inputCredits: 0,
        outputCredits: 0,
      },
    });

    abortController.abort();

    expect(requestSignal?.aborted).toBe(true);
  });
});
