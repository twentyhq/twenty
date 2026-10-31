import { generateText, type OutputInterface } from 'ai';
import { type AgentResponseFormat } from 'twenty-shared/ai';

import { AgentRunTurnService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-turn.service';
import { AiException } from 'src/engine/metadata-modules/ai/ai.exception';

jest.mock('ai', () => ({
  ...jest.requireActual('ai'),
  generateText: jest.fn(),
}));

const WORKSPACE_ID = 'workspace-id';

const JSON_RESPONSE_FORMAT: AgentResponseFormat = {
  type: 'json',
  schema: {
    type: 'object',
    properties: { fit: { type: 'boolean' } },
  },
};

const PERSONA = {
  agentId: null,
  applicationId: 'application-id',
  instructions: 'Qualify leads.',
  modelId: 'model-id',
  modelConfiguration: null,
  responseFormat: null,
  promptCacheKey: 'ai-generate:application-id',
  permissions: { type: 'scope' as const, scope: null },
};

const EXECUTION_CONTEXT = {
  authContext: { type: 'application' },
  userWorkspaceId: null,
  usageOperationType: 'AI_WORKFLOW_TOKEN',
  agentRunRoleIds: {},
} as never;

const STEP_USAGE = { inputTokens: 100, outputTokens: 10, totalTokens: 110 };

const buildTurn = (output: Promise<unknown>) => ({
  stream: {
    stream: new ReadableStream({ start: (controller) => controller.close() }),
    text: Promise.resolve('{"fit":true}'),
    usage: Promise.resolve(STEP_USAGE),
    steps: Promise.resolve([]),
    output,
  },
  registeredModel: {
    model: 'language-model',
    modelId: 'model-id',
    sdkPackage: '@ai-sdk/openai',
  },
  modelConfig: { modelId: 'model-id' },
  toolset: { offeredPausingToolNames: [] },
  getStopReason: () => null,
});

const buildService = ({
  output = Promise.resolve({ fit: true }),
}: { output?: Promise<unknown> } = {}) => {
  const agentTurnService = {
    start: jest.fn().mockResolvedValue(buildTurn(output)),
  };
  const aiBillingService = {
    assertAiExecutionAllowed: jest.fn().mockResolvedValue(undefined),
    calculateAndBillUsage: jest.fn().mockResolvedValue(undefined),
    calculateStepsCost: jest.fn().mockReturnValue(0),
  };

  const service = new AgentRunTurnService(
    agentTurnService as never,
    aiBillingService as never,
    {} as never,
    {} as never,
    {} as never,
    { findOneBy: jest.fn().mockResolvedValue(null) } as never,
  );

  return { service, agentTurnService, aiBillingService };
};

const TURN_INPUT = {
  persona: PERSONA,
  responseFormat: JSON_RESPONSE_FORMAT,
  messages: [{ role: 'user' as const, content: 'Is Acme a good fit?' }],
  baseSystemPrompt: 'You answer for an application.',
  workspaceId: WORKSPACE_ID,
  executionContext: EXECUTION_CONTEXT,
};

describe('AgentRunTurnService', () => {
  beforeEach(() => {
    jest.mocked(generateText).mockReset();
  });

  it('puts the schema on the one model request of a same-request turn', async () => {
    const { service, agentTurnService, aiBillingService } = buildService();
    const input = {
      ...TURN_INPUT,
      structuredOutputStrategy: 'same-request' as const,
    };

    const started = await service.startTurn(input);
    const completed = await service.completeTurn({ ...input, started });

    expect(agentTurnService.start).toHaveBeenCalledTimes(1);

    const { output }: { output: OutputInterface } =
      agentTurnService.start.mock.calls[0][0];

    await expect(output.responseFormat).resolves.toEqual({
      type: 'json',
      schema: {
        type: 'object',
        properties: { fit: { type: 'boolean' } },
        required: ['fit'],
        additionalProperties: false,
      },
    });
    expect(generateText).toHaveBeenCalledTimes(0);
    expect(aiBillingService.calculateAndBillUsage).toHaveBeenCalledTimes(0);
    expect(completed.result).toEqual({ fit: true });
    expect(completed.structuredOutputSteps).toEqual([]);
  });

  it('fails a same-request turn whose reply is not an object', async () => {
    const output = Promise.reject(new Error('No object generated'));

    // the turn reads the output only once the stream ends
    output.catch(() => undefined);

    const { service } = buildService({ output });
    const input = {
      ...TURN_INPUT,
      structuredOutputStrategy: 'same-request' as const,
    };

    const started = await service.startTurn(input);

    await expect(
      service.completeTurn({ ...input, started }),
    ).rejects.toBeInstanceOf(AiException);
    expect(generateText).toHaveBeenCalledTimes(0);
  });

  it('converts the reply with a follow-up request by default, as agents and workflow steps do', async () => {
    const structuredOutputSteps = [{ usage: STEP_USAGE, toolCalls: [] }];

    jest.mocked(generateText).mockResolvedValue({
      output: { fit: false },
      usage: STEP_USAGE,
      steps: structuredOutputSteps,
    } as never);

    const { service, agentTurnService, aiBillingService } = buildService();

    const started = await service.startTurn(TURN_INPUT);
    const completed = await service.completeTurn({ ...TURN_INPUT, started });

    expect(agentTurnService.start).toHaveBeenCalledTimes(1);
    expect(agentTurnService.start.mock.calls[0][0].output).toBeUndefined();
    expect(generateText).toHaveBeenCalledTimes(1);
    expect(aiBillingService.calculateAndBillUsage).toHaveBeenCalledTimes(1);
    expect(completed.result).toEqual({ fit: false });
    expect(completed.structuredOutputSteps).toEqual(structuredOutputSteps);
  });

  it('sends no schema for a text response', async () => {
    const { service, agentTurnService } = buildService();
    const input = {
      ...TURN_INPUT,
      responseFormat: { type: 'text' as const },
      structuredOutputStrategy: 'same-request' as const,
    };

    const started = await service.startTurn(input);
    const completed = await service.completeTurn({ ...input, started });

    expect(agentTurnService.start.mock.calls[0][0].output).toBeUndefined();
    expect(generateText).toHaveBeenCalledTimes(0);
    expect(completed.result).toEqual({ response: '{"fit":true}' });
  });
});
