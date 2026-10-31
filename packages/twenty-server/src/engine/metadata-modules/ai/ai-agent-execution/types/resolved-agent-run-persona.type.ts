import {
  type AgentResponseFormat,
  type AiRunScope,
  type ModelConfiguration,
} from 'twenty-shared/ai';

// What a turn runs as, whether a reusable agent or the run's own config supplies it
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
