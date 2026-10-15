import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { buildAgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-summary.util';

jest.mock(
  'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-agent-steps-to-tool-call-logs.util',
  () => ({
    mapAgentStepsToToolCallLogs: jest.fn().mockReturnValue([
      {
        toolName: 'web_search',
        toolCallId: 'call-1',
        state: 'success',
      },
    ]),
  }),
);

const baseExecution: AgentExecutionResult = {
  result: { answer: 'hello' },
  usage: {
    inputTokens: 100,
    outputTokens: 50,
    totalTokens: 150,
    inputTokenDetails: { cacheReadTokens: 20 },
    outputTokenDetails: { reasoningTokens: 10 },
  } as AgentExecutionResult['usage'],
  cacheCreationTokens: 5,
  nativeWebSearchCallCount: 2,
  hasNoMoreAvailableCredits: false,
  isPaused: false,
  modelId: 'claude-sonnet-4',
  totalCostInDollars: 0.012,
  creditsUsedMicro: 12_000,
  turnUsage: {
    inputTokens: 100,
    outputTokens: 50,
    cacheReadTokens: 20,
    cacheCreationTokens: 5,
    inputCredits: 0,
    outputCredits: 0,
  },
  steps: [],
};

describe('buildAgentRunSummary', () => {
  it('summarizes usage, cost and tool calls of a run', () => {
    expect(
      buildAgentRunSummary({ execution: baseExecution, durationMs: 1234 }),
    ).toEqual({
      modelId: 'claude-sonnet-4',
      usage: {
        inputTokens: 100,
        outputTokens: 50,
        reasoningTokens: 10,
        cacheReadTokens: 20,
        cacheCreationTokens: 5,
        totalTokens: 150,
      },
      cost: { totalCostInDollars: 0.012, creditsUsedMicro: 12_000 },
      nativeWebSearchCallCount: 2,
      toolCalls: [
        { toolName: 'web_search', toolCallId: 'call-1', state: 'success' },
      ],
      durationMs: 1234,
    });
  });

  it('falls back to zero tokens when the provider did not report usage', () => {
    const summary = buildAgentRunSummary({
      execution: {
        ...baseExecution,
        usage: {} as AgentExecutionResult['usage'],
      },
      durationMs: 100,
    });

    expect(summary.usage.inputTokens).toBe(0);
    expect(summary.usage.outputTokens).toBe(0);
    expect(summary.usage.totalTokens).toBe(0);
  });
});
