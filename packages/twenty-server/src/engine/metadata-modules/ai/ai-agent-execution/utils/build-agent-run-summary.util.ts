import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type AgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-summary.type';
import { mapAgentStepsToToolCallLogs } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-agent-steps-to-tool-call-logs.util';

export const buildAgentRunSummary = ({
  execution,
  durationMs,
}: {
  execution: AgentExecutionResult;
  durationMs: number;
}): AgentRunSummary => ({
  modelId: execution.modelId,
  usage: {
    inputTokens: execution.usage.inputTokens ?? 0,
    outputTokens: execution.usage.outputTokens ?? 0,
    reasoningTokens: execution.usage.outputTokenDetails?.reasoningTokens,
    cacheReadTokens: execution.usage.inputTokenDetails?.cacheReadTokens,
    cacheCreationTokens: execution.cacheCreationTokens,
    totalTokens: execution.usage.totalTokens ?? 0,
  },
  cost: {
    totalCostInDollars: execution.totalCostInDollars,
    creditsUsedMicro: execution.creditsUsedMicro,
  },
  nativeWebSearchCallCount: execution.nativeWebSearchCallCount,
  toolCalls: mapAgentStepsToToolCallLogs(execution.steps),
  durationMs,
});
