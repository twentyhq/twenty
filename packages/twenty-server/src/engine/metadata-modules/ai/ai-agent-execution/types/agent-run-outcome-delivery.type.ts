import { type AgentRunSummary } from 'twenty-shared/ai';

import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunCallerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-outcome.type';

export type AgentRunOutcomeDelivery = {
  workspaceId: string;
  caller: AgentRunCaller;
  threadId: string;
  outcome: AgentRunCallerOutcome;
  summary: AgentRunSummary | null;
  attempt?: number;
};
