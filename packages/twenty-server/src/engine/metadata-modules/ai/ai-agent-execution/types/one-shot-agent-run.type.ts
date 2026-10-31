import { type AgentRunSummary } from 'twenty-shared/ai';

import { type AgentRunCallerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-outcome.type';
import { type AgentTurnUsage } from 'src/engine/metadata-modules/ai/ai-billing/types/agent-turn-usage.type';

export type OneShotAgentRun = {
  // null when the run failed before its turn was recorded
  turnId: string | null;
  outcome: AgentRunCallerOutcome;
  // null when the run failed before its turn completed
  summary: AgentRunSummary | null;
  // null when the run failed before any model step finished
  usage: AgentTurnUsage | null;
};
