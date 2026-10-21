import { type AgentRunSummary } from 'twenty-shared/ai';

import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunSpec } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-spec.type';

// What a run paused on an answer or a wait keeps in its wake-up: what continues it, and who gets its outcome
export type AgentRunSuspension = {
  caller: AgentRunCaller;
  runSpec: AgentRunSpec;
  // summed across the run's segments, so the caller gets one total
  summary: AgentRunSummary | null;
  // how many times the run went on, so one that keeps pausing is stopped
  continuationCount: number;
};
