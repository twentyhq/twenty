import { type AgentRunWakeUpOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-wake-up-outcome.type';

export type ContinueAgentRunJobData = {
  workspaceId: string;
  threadId: string;
  // the run's wake-up, which the continuation removes once the run went on, and what resolved it
  wakeUpId: string;
  outcome: AgentRunWakeUpOutcome;
  // set on the delayed copy of a run parked behind a busy conversation
  parkId?: string;
};
