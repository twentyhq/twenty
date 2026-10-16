import { type AgentRunnerRunInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-run-input.type';

// the agent and how the run acts are read again in the job from the spec and the caller
export type RunAgentJobData = Omit<
  AgentRunnerRunInput,
  'agent' | 'executionContext'
> & {
  busyAttempt?: number;
};
