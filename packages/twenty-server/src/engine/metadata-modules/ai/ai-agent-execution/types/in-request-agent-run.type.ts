import { type AiRunUsage } from 'twenty-shared/application';

import { type AgentRunnerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-outcome.type';

export type InRequestAgentRun = {
  runId: string;
  outcome: AgentRunnerOutcome;
  // read back from the turn, which records what a failed run spent too
  usage: AiRunUsage;
};
