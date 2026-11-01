import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';

export type AgentRunCallerInput = {
  workspaceId: string;
  caller: AgentRunCaller;
};
