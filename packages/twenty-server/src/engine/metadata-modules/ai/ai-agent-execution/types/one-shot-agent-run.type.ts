import { type AgentRunSummary } from 'twenty-shared/ai';

import { type AgentRunCallerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-outcome.type';

export type OneShotAgentRun = {
  // null when the run failed before its turn was recorded
  turnId: string | null;
  outcome: AgentRunCallerOutcome;
  // null when the run failed before its turn completed
  summary: AgentRunSummary | null;
};
