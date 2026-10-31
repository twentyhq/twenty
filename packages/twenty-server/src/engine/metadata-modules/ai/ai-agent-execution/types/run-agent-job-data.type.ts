import { type AgentRunConversation } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-conversation.type';
import { type AgentRunnerRunInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-run-input.type';

// what the run acts as, and how, are read again in the job from the spec and the caller
export type RunAgentJobData = Omit<
  AgentRunnerRunInput,
  'persona' | 'executionContext' | 'conversation'
> & {
  // null for a one-shot run: no thread, no claim, and nothing to pause on
  conversation: AgentRunConversation | null;
  // only on a delayed copy parked in Redis by the previous release
  parkId?: string;
};
