import { type LanguageModelV4Content } from '@ai-sdk/provider';
import { tool, type ToolSet } from 'ai';
import { createScriptedLanguageModel } from 'test/utils/create-scripted-language-model.util';
import { z } from 'zod';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { AgentStepLoopService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-step-loop.service';
import { type RegisteredAiModel } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

const USAGE = {
  inputTokens: {
    total: 10,
    noCache: 10,
    cacheRead: undefined,
    cacheWrite: undefined,
  },
  outputTokens: { total: 5, text: 5, reasoning: undefined },
};

const toolCall = (toolName: string, input: object): LanguageModelV4Content => ({
  type: 'tool-call',
  toolCallId: `${toolName}-call`,
  toolName,
  input: JSON.stringify(input),
});

const buildLoop = ({
  responses,
  tools,
  hasNoMoreAvailableCredits = false,
  failingCallIndex,
}: {
  responses: LanguageModelV4Content[][];
  tools: ToolSet;
  hasNoMoreAvailableCredits?: boolean;
  failingCallIndex?: number;
}) => {
  const aiBillingService = {
    decrementAndCheckAvailableCredits: jest
      .fn()
      .mockResolvedValue({ hasNoMoreAvailableCredits }),
  };
  const metricsService = {
    recordHistogram: jest.fn(),
    incrementCounterBy: jest.fn(),
  };
  const service = new AgentStepLoopService(
    aiBillingService as never,
    metricsService as never,
  );

  const onError = jest.fn();

  const model = createScriptedLanguageModel((_options, callIndex) => {
    if (callIndex === failingCallIndex) {
      throw new Error('provider down');
    }

    const content = responses[callIndex] ?? [{ type: 'text', text: 'Done' }];

    return {
      content,
      finishReason: {
        unified: content.some((part) => part.type === 'tool-call')
          ? 'tool-calls'
          : 'stop',
        raw: undefined,
      },
      usage: USAGE,
    };
  });

  const loop = service.start({
    registeredModel: {
      modelId: 'test-model',
      sdkPackage: '@ai-sdk/openai',
      model,
    } as RegisteredAiModel,
    modelConfig: { sdkPackage: '@ai-sdk/openai' },
    systemPrompt: 'You are a test agent.',
    messages: [{ role: 'user', content: 'Go' }],
    tools,
    billing: {
      workspaceId: 'workspace-id',
      operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
      userWorkspaceId: null,
      agentId: 'agent-id',
    },
    telemetry: { functionId: 'test' },
    metricsScope: 'agent',
    offeredPausingToolNames: ['ask_person'],
    onError,
  });

  return { loop, aiBillingService, onError };
};

const lookupTool = tool({
  inputSchema: z.object({ query: z.string() }),
  execute: async () => ({ success: true, result: { found: 1 } }),
});

const askPersonTool = tool({
  inputSchema: z.object({ question: z.string() }),
  execute: async () => ({ success: true, result: { status: 'pending' } }),
});

describe('AgentStepLoopService', () => {
  it('runs tool steps until the model answers and charges each step', async () => {
    const { loop, aiBillingService } = buildLoop({
      responses: [[toolCall('lookup', { query: 'acme' })]],
      tools: { lookup: lookupTool },
    });

    expect(await loop.stream.text).toBe('Done');
    expect(await loop.stream.steps).toHaveLength(2);
    expect(
      aiBillingService.decrementAndCheckAvailableCredits,
    ).toHaveBeenCalledTimes(2);
    expect(loop.getFinishedSteps()).toHaveLength(2);
  });

  it('keeps the steps that finished, and their charge, when a later model call fails', async () => {
    const { loop, aiBillingService, onError } = buildLoop({
      responses: [[toolCall('lookup', { query: 'acme' })]],
      tools: { lookup: lookupTool },
      failingCallIndex: 1,
    });

    await loop.stream.consumeStream();

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'provider down' }),
    );
    expect(loop.getFinishedSteps()).toHaveLength(1);
    expect(loop.getFinishedSteps()[0].usage.inputTokens).toBe(10);
    expect(
      aiBillingService.decrementAndCheckAvailableCredits,
    ).toHaveBeenCalledTimes(1);
  });

  it('stops on an offered pausing tool that waits on a person', async () => {
    const { loop } = buildLoop({
      responses: [[toolCall('ask_person', { question: 'Which deal?' })]],
      tools: { ask_person: askPersonTool },
    });

    const steps = await loop.stream.steps;

    expect(steps).toHaveLength(1);
    expect(steps[0].toolResults[0]?.toolName).toBe('ask_person');
  });

  it('stops once the workspace runs out of credits', async () => {
    const { loop } = buildLoop({
      responses: [
        [toolCall('lookup', { query: 'acme' })],
        [toolCall('lookup', { query: 'globex' })],
      ],
      tools: { lookup: lookupTool },
      hasNoMoreAvailableCredits: true,
    });

    expect(await loop.stream.steps).toHaveLength(1);
    expect(loop.hasNoMoreAvailableCredits()).toBe(true);
  });
});
