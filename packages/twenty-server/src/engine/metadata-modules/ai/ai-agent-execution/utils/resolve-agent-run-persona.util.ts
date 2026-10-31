import { tipTapDocumentToMarkdown } from 'twenty-shared/utils';

import { type AgentRunInlineConfig } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-inline-config.type';
import { type ResolvedAgentRunPersona } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/resolved-agent-run-persona.type';
import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';

export const resolveAgentRunPersonaFromAgent = (
  agent: AgentEntity,
): ResolvedAgentRunPersona => ({
  agentId: agent.id,
  applicationId: agent.applicationId,
  instructions: tipTapDocumentToMarkdown(agent.prompt),
  modelId: agent.modelId,
  modelConfiguration: agent.modelConfiguration ?? null,
  responseFormat: agent.responseFormat ?? null,
  promptCacheKey: agent.id,
  permissions: {
    type: 'agentRole',
    workspaceId: agent.workspaceId,
    agentId: agent.id,
  },
});

export const resolveAgentRunPersonaFromInlineConfig = (
  inlineConfig: AgentRunInlineConfig,
): ResolvedAgentRunPersona => ({
  agentId: null,
  applicationId: inlineConfig.applicationId,
  instructions: tipTapDocumentToMarkdown(inlineConfig.instructions),
  modelId: inlineConfig.modelId,
  modelConfiguration: inlineConfig.modelConfiguration,
  responseFormat: null,
  promptCacheKey: inlineConfig.promptCacheKey,
  permissions: { type: 'scope', scope: inlineConfig.scope },
});
