import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';

export type AgentRunCallerInput<
  TCaller extends AgentRunCaller = AgentRunCaller,
> = {
  workspaceId: string;
  caller: TCaller;
};
