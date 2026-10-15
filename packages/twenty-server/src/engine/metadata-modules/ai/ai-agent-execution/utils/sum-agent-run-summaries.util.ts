import { type AgentRunSummary } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

// a count no segment reported stays out
const sumCounts = <TCounts extends Record<string, number | undefined>>(
  previousCounts: TCounts,
  nextCounts: TCounts,
): TCounts =>
  Object.fromEntries(
    Object.keys({ ...previousCounts, ...nextCounts }).map((key) => [
      key,
      isDefined(previousCounts[key]) || isDefined(nextCounts[key])
        ? (previousCounts[key] ?? 0) + (nextCounts[key] ?? 0)
        : undefined,
    ]),
  ) as TCounts;

// A run continued after a pause spans several segments, which its caller sees as one run
export const sumAgentRunSummaries = ({
  previousSummary,
  nextSummary,
}: {
  previousSummary: AgentRunSummary | null;
  nextSummary: AgentRunSummary;
}): AgentRunSummary =>
  isDefined(previousSummary)
    ? {
        ...nextSummary,
        usage: sumCounts(previousSummary.usage, nextSummary.usage),
        cost: sumCounts(previousSummary.cost, nextSummary.cost),
        nativeWebSearchCallCount:
          previousSummary.nativeWebSearchCallCount +
          nextSummary.nativeWebSearchCallCount,
        toolCalls: [...previousSummary.toolCalls, ...nextSummary.toolCalls],
        durationMs: previousSummary.durationMs + nextSummary.durationMs,
      }
    : nextSummary;
