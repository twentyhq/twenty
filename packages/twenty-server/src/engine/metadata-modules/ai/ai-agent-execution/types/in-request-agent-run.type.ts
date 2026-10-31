import { type AgentRunSummary } from 'twenty-shared/ai';

import { type AgentRunnerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-outcome.type';

export type InRequestAgentRun = {
  // the run's recorded turn, with its model, usage and credits
  runId: string;
  outcome: AgentRunnerOutcome;
  // null when the run failed before its turn completed
  summary: AgentRunSummary | null;
};
