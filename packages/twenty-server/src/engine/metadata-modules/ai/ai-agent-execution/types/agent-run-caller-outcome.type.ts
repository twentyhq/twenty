import { type AgentRunnerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-outcome.type';

// what a caller gets once it stops waiting: how its run ended
export type AgentRunCallerOutcome = Exclude<
  AgentRunnerOutcome,
  { status: 'SUSPENDED' }
>;
