import { type AgentRunSummary } from 'twenty-shared/ai';

import { sumAgentRunSummaries } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/sum-agent-run-summaries.util';

const buildSummary = ({
  modelId,
  tokens,
  toolCallNames,
  durationMs,
  reasoningTokens,
}: {
  modelId: string;
  tokens: number;
  toolCallNames: string[];
  durationMs: number;
  reasoningTokens?: number;
}): AgentRunSummary => ({
  modelId,
  usage: {
    inputTokens: tokens,
    outputTokens: tokens,
    reasoningTokens,
    totalTokens: tokens * 2,
  },
  cost: { totalCostInDollars: tokens / 100, creditsUsedMicro: tokens },
  nativeWebSearchCallCount: 1,
  toolCalls: toolCallNames.map((toolName) => ({
    toolName,
    toolCallId: `${toolName}-call`,
    state: 'success',
  })),
  durationMs,
});

describe('sumAgentRunSummaries', () => {
  it('adds the segment after a pause to the ones before it', () => {
    const summary = sumAgentRunSummaries({
      previousSummary: buildSummary({
        modelId: 'model-a',
        tokens: 10,
        toolCallNames: ['search', 'ask_question'],
        durationMs: 100,
        reasoningTokens: 10,
      }),
      nextSummary: buildSummary({
        modelId: 'model-b',
        tokens: 5,
        toolCallNames: ['send_email'],
        durationMs: 50,
        reasoningTokens: 5,
      }),
    });

    expect(summary).toMatchObject({
      modelId: 'model-b',
      usage: {
        inputTokens: 15,
        outputTokens: 15,
        reasoningTokens: 15,
        totalTokens: 30,
      },
      cost: { totalCostInDollars: expect.closeTo(0.15), creditsUsedMicro: 15 },
      nativeWebSearchCallCount: 2,
      durationMs: 150,
    });
    expect(summary.toolCalls.map(({ toolName }) => toolName)).toEqual([
      'search',
      'ask_question',
      'send_email',
    ]);
  });

  it('leaves an optional count out when no segment reported it', () => {
    const summary = sumAgentRunSummaries({
      previousSummary: buildSummary({
        modelId: 'model-a',
        tokens: 1,
        toolCallNames: [],
        durationMs: 1,
      }),
      nextSummary: buildSummary({
        modelId: 'model-a',
        tokens: 1,
        toolCallNames: [],
        durationMs: 1,
      }),
    });

    expect(summary.usage.reasoningTokens).toBeUndefined();
  });
});
