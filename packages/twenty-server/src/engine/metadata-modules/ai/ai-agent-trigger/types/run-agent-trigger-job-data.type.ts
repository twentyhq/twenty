import { type AgentTriggerPayload } from 'src/engine/metadata-modules/ai/ai-agent-trigger/types/agent-trigger-payload.type';

export type RunAgentTriggerJobData = {
  workspaceId: string;
  agentId: string;
  triggerId: string;
  // Records in the payload were filtered for this role, so the run is dropped if the agent's role changed since
  dispatchedRoleId?: string;
  payload: AgentTriggerPayload;
};
