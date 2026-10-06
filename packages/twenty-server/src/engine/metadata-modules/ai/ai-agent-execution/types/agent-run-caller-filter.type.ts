import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';

// matches every caller whose ref holds these values, such as every step of one run
export type AgentRunCallerFilter = {
  type: AgentRunCaller['type'];
  ref: Partial<AgentRunCaller['ref']>;
};
