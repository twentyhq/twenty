import { type AgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-summary.type';
import { type AgentRunnerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-outcome.type';

export type AgentRunnerResult = {
  threadId: string;
  outcome: AgentRunnerOutcome;
  // the run so far, across every segment of a continued run
  summary: AgentRunSummary;
};
