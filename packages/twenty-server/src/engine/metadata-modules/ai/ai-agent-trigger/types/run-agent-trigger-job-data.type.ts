import { type AgentTriggerPayload } from 'src/engine/metadata-modules/ai/ai-agent-trigger/types/agent-trigger-payload.type';

export type RunAgentTriggerJobData = {
  workspaceId: string;
  agentId: string;
  triggerId: string;
  payload: AgentTriggerPayload;
};
