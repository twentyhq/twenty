import {
  type AgentResponseFormat,
  type AiRunScope,
  type ModelConfiguration,
} from 'twenty-shared/ai';

export type ResolvedAgentRunPersona = {
  agentId: string | null;
  applicationId: string | null;
  instructions: string;
  modelId: string;
  modelConfiguration: ModelConfiguration | null;
  responseFormat: AgentResponseFormat | null;
  promptCacheKey: string;
  permissions:
    | { type: 'agentRole'; workspaceId: string; agentId: string }
    | { type: 'scope'; scope: AiRunScope | null };
};
